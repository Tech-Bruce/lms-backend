const TaskCourse = require("../models/TaskCurriculum/TaskCourse");
const ChapterRoom = require("../models/TaskCurriculum/ChapterRoom");
const RoomTask = require("../models/TaskCurriculum/RoomTask");

// ==========================================
// COURSE / MODULE CONTROLLERS
// ==========================================

// Get all courses with rooms and tasks count
exports.getAllCourses = async (req, res) => {
  try {
    const { track, status, search } = req.query;
    let query = {};

    if (track && track !== "all") {
      query.track = track;
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const courses = await TaskCourse.find(query).sort({ order: 1, createdAt: 1 });

    // Enrich courses with room count and task count
    const enrichedCourses = await Promise.all(
      courses.map(async (course) => {
        const roomsCount = await ChapterRoom.countDocuments({ courseId: course._id });
        const tasksCount = await RoomTask.countDocuments({ courseId: course._id });
        return {
          ...course.toObject(),
          totalRooms: roomsCount,
          totalTasks: tasksCount,
        };
      })
    );

    res.status(200).json(enrichedCourses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
};

// Get single course with its chapters and tasks
exports.getCourseById = async (req, res) => {
  try {
    const course = await TaskCourse.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const chapters = await ChapterRoom.find({ courseId: course._id }).sort({ order: 1, createdAt: 1 });

    const chaptersWithTasks = await Promise.all(
      chapters.map(async (chapter) => {
        const tasks = await RoomTask.find({ chapterId: chapter._id }).sort({ order: 1, createdAt: 1 });
        return {
          ...chapter.toObject(),
          tasks,
          totalTasks: tasks.length,
        };
      })
    );

    res.status(200).json({
      ...course.toObject(),
      chapters: chaptersWithTasks,
      totalRooms: chaptersWithTasks.length,
      totalTasks: chaptersWithTasks.reduce((acc, ch) => acc + ch.tasks.length, 0),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course details", error: error.message });
  }
};

// Create new Course
exports.createCourse = async (req, res) => {
  try {
    const { title, track, description, icon, badgeColor, level, status, order, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const course = new TaskCourse({
      title,
      track: track || "Network Fundamentals",
      description,
      icon: icon || "Network",
      badgeColor: badgeColor || "blue",
      level: level || "Beginner",
      status: status || "published",
      order: order !== undefined ? Number(order) : 0,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    });

    const saved = await course.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to create course", error: error.message });
  }
};

// Update Course
exports.updateCourse = async (req, res) => {
  try {
    const updated = await TaskCourse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update course", error: error.message });
  }
};

// Delete Course (Cascade delete associated chapters & tasks)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await TaskCourse.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Cascade delete chapters & tasks
    await ChapterRoom.deleteMany({ courseId: course._id });
    await RoomTask.deleteMany({ courseId: course._id });

    res.status(200).json({ message: "Course and all associated rooms and tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};

// ==========================================
// CHAPTER / ROOM CONTROLLERS
// ==========================================

// Get all chapters (optionally by courseId)
exports.getChapters = async (req, res) => {
  try {
    const { courseId, search } = req.query;
    let query = {};
    if (courseId) query.courseId = courseId;
    if (search) query.title = { $regex: search, $options: "i" };

    const chapters = await ChapterRoom.find(query).sort({ order: 1, createdAt: 1 });

    const enriched = await Promise.all(
      chapters.map(async (ch) => {
        const tasksCount = await RoomTask.countDocuments({ chapterId: ch._id });
        return {
          ...ch.toObject(),
          totalTasks: tasksCount,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chapters", error: error.message });
  }
};

// Get single chapter by ID with tasks
exports.getChapterById = async (req, res) => {
  try {
    const chapter = await ChapterRoom.findById(req.params.id).populate("courseId");
    if (!chapter) {
      return res.status(404).json({ message: "Chapter room not found" });
    }

    const tasks = await RoomTask.find({ chapterId: chapter._id }).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      ...chapter.toObject(),
      tasks,
      totalTasks: tasks.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chapter", error: error.message });
  }
};

// Create Chapter / Room
exports.createChapter = async (req, res) => {
  try {
    const { courseId, roomNumber, title, description, level, estimatedTime, xp, icon, order } = req.body;

    if (!courseId || !title || !description) {
      return res.status(400).json({ message: "Course, Title, and Description are required" });
    }

    // Auto calculate roomNumber if not passed
    let finalRoomNumber = roomNumber;
    if (!finalRoomNumber) {
      const count = await ChapterRoom.countDocuments({ courseId });
      finalRoomNumber = `Room ${String(count + 1).padStart(2, "0")}`;
    }

    const chapter = new ChapterRoom({
      courseId,
      roomNumber: finalRoomNumber,
      title,
      description,
      level: level || "Easy",
      estimatedTime: estimatedTime || "45 minutes",
      xp: xp !== undefined ? Number(xp) : 100,
      icon: icon || "Network",
      order: order !== undefined ? Number(order) : 0,
    });

    const saved = await chapter.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to create chapter", error: error.message });
  }
};

// Update Chapter / Room
exports.updateChapter = async (req, res) => {
  try {
    const updated = await ChapterRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update chapter", error: error.message });
  }
};

// Delete Chapter / Room (Cascade delete associated tasks)
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await ChapterRoom.findByIdAndDelete(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    await RoomTask.deleteMany({ chapterId: chapter._id });

    res.status(200).json({ message: "Chapter and its tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chapter", error: error.message });
  }
};

// ==========================================
// TASK CONTROLLERS
// ==========================================

// Get all tasks (optionally by chapterId or courseId)
exports.getTasks = async (req, res) => {
  try {
    const { chapterId, courseId } = req.query;
    let query = {};
    if (chapterId) query.chapterId = chapterId;
    if (courseId) query.courseId = courseId;

    const tasks = await RoomTask.find(query).sort({ order: 1, createdAt: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await RoomTask.findById(req.params.id)
      .populate("chapterId")
      .populate("courseId");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task", error: error.message });
  }
};

// Create Task
exports.createTask = async (req, res) => {
  try {
    const {
      courseId,
      chapterId,
      taskNumber,
      title,
      overview,
      content,
      learningObjectives,
      prerequisites,
      questions,
      xp,
      order,
    } = req.body;

    if (!chapterId || !title || !content) {
      return res.status(400).json({ message: "Chapter, Task Title, and Task Content are required" });
    }

    // Auto determine courseId if not provided
    let finalCourseId = courseId;
    if (!finalCourseId) {
      const chapter = await ChapterRoom.findById(chapterId);
      if (!chapter) return res.status(404).json({ message: "Chapter not found" });
      finalCourseId = chapter.courseId;
    }

    // Auto format taskNumber if not provided
    let finalTaskNumber = taskNumber;
    if (!finalTaskNumber) {
      const count = await RoomTask.countDocuments({ chapterId });
      finalTaskNumber = `Task ${count + 1}`;
    }

    const task = new RoomTask({
      courseId: finalCourseId,
      chapterId,
      taskNumber: finalTaskNumber,
      title,
      overview: overview || "",
      content,
      learningObjectives: Array.isArray(learningObjectives)
        ? learningObjectives
        : learningObjectives
        ? [learningObjectives]
        : [],
      prerequisites: Array.isArray(prerequisites)
        ? prerequisites
        : prerequisites
        ? [prerequisites]
        : [],
      questions: Array.isArray(questions) ? questions : [],
      xp: xp !== undefined ? Number(xp) : 20,
      order: order !== undefined ? Number(order) : 0,
    });

    const saved = await task.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to create task", error: error.message });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const updated = await RoomTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update task", error: error.message });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await RoomTask.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

// ==========================================
// BULK UPLOAD & CURRICULUM TREE
// ==========================================

// Get entire tree (Courses -> Chapters -> Tasks) for fast UI loading
exports.getFullCurriculumTree = async (req, res) => {
  try {
    const courses = await TaskCourse.find().sort({ order: 1, createdAt: 1 });
    const chapters = await ChapterRoom.find().sort({ order: 1, createdAt: 1 });
    const tasks = await RoomTask.find().sort({ order: 1, createdAt: 1 });

    const tree = courses.map((course) => {
      const courseChapters = chapters
        .filter((ch) => ch.courseId.toString() === course._id.toString())
        .map((ch) => {
          const chTasks = tasks.filter((t) => t.chapterId.toString() === ch._id.toString());
          return {
            ...ch.toObject(),
            tasks: chTasks,
            totalTasks: chTasks.length,
          };
        });

      return {
        ...course.toObject(),
        chapters: courseChapters,
        totalRooms: courseChapters.length,
        totalTasks: courseChapters.reduce((acc, ch) => acc + ch.tasks.length, 0),
      };
    });

    res.status(200).json(tree);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch full curriculum tree", error: error.message });
  }
};

// Bulk create/upload a Course with Chapters & Tasks
exports.bulkUploadCourse = async (req, res) => {
  try {
    const { course, chapters } = req.body;
    if (!course || !course.title) {
      return res.status(400).json({ message: "Course title is required" });
    }

    // 1. Create Course
    const newCourse = new TaskCourse({
      title: course.title,
      track: course.track || "Network Fundamentals",
      description: course.description || "",
      icon: course.icon || "Network",
      badgeColor: course.badgeColor || "blue",
      level: course.level || "Beginner",
      status: course.status || "published",
    });
    const savedCourse = await newCourse.save();

    // 2. Create Chapters & Tasks
    if (Array.isArray(chapters) && chapters.length > 0) {
      for (let i = 0; i < chapters.length; i++) {
        const chData = chapters[i];
        const newChapter = new ChapterRoom({
          courseId: savedCourse._id,
          roomNumber: chData.roomNumber || `Room ${String(i + 1).padStart(2, "0")}`,
          title: chData.title,
          description: chData.description || "",
          level: chData.level || "Easy",
          estimatedTime: chData.estimatedTime || "45 minutes",
          xp: chData.xp || 100,
          icon: chData.icon || "Network",
          order: i,
        });
        const savedChapter = await newChapter.save();

        if (Array.isArray(chData.tasks) && chData.tasks.length > 0) {
          for (let j = 0; j < chData.tasks.length; j++) {
            const tData = chData.tasks[j];
            const newTask = new RoomTask({
              courseId: savedCourse._id,
              chapterId: savedChapter._id,
              taskNumber: tData.taskNumber || `Task ${j + 1}`,
              title: tData.title || `Task ${j + 1}: Lesson`,
              overview: tData.overview || "",
              content: tData.content || "Content goes here...",
              learningObjectives: tData.learningObjectives || [],
              prerequisites: tData.prerequisites || [],
              questions: tData.questions || [],
              xp: tData.xp || 20,
              order: j,
            });
            await newTask.save();
          }
        }
      }
    }

    res.status(201).json({ 
      message: "Course and complete curriculum hierarchy successfully uploaded and created!", 
      courseId: savedCourse._id,
      course: savedCourse 
    });
  } catch (error) {
    res.status(400).json({ message: "Bulk upload failed", error: error.message });
  }
};

// Clear all curriculum data (Courses, Chapters, Tasks)
exports.clearAllCurriculum = async (req, res) => {
  try {
    await TaskCourse.deleteMany({});
    await ChapterRoom.deleteMany({});
    await RoomTask.deleteMany({});
    res.status(200).json({ message: "All curriculum data cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear curriculum data", error: error.message });
  }
};

// ==========================================
// SEED REFERENCE DATA (Exact data from screenshots)
// ==========================================
exports.seedReferenceData = async (req, res) => {
  try {
    // Check if courses already exist
    const existingCount = await TaskCourse.countDocuments();
    if (existingCount > 0 && req.query.force !== "true") {
      return res.status(200).json({
        message: "Curriculum courses already exist. Use ?force=true to reset and re-seed.",
        count: existingCount,
      });
    }

    // Clear existing task curriculum if force reset
    await TaskCourse.deleteMany({});
    await ChapterRoom.deleteMany({});
    await RoomTask.deleteMany({});

    // 1. Network Fundamentals 1
    const net1 = await TaskCourse.create({
      title: "Network Fundamentals 1",
      track: "Network Fundamentals",
      description:
        "Master core networking concepts that power all cybersecurity. Learn TCP/IP, protocols, and basic network architecture.",
      icon: "Network",
      badgeColor: "blue",
      level: "Beginner",
      status: "published",
      order: 1,
    });

    // Network Fundamentals 2
    const net2 = await TaskCourse.create({
      title: "Network Fundamentals 2",
      track: "Network Fundamentals",
      description:
        "Advanced networking concepts, routing, switching, VLANs, and subnetting for enterprise environments.",
      icon: "Server",
      badgeColor: "cyan",
      level: "Intermediate",
      status: "published",
      order: 2,
    });

    // Network Fundamentals 3
    const net3 = await TaskCourse.create({
      title: "Network Fundamentals 3",
      track: "Network Fundamentals",
      description:
        "Expert-level network architecture, security design, and implementation strategies for large-scale networks.",
      icon: "Share2",
      badgeColor: "amber",
      level: "Advanced",
      status: "published",
      order: 3,
    });

    // Security Fundamentals 1
    const sec1 = await TaskCourse.create({
      title: "Security Fundamentals 1",
      track: "Security Fundamentals",
      description:
        "Basic security concepts, principles, CIA triad, risk management, and security frameworks.",
      icon: "Shield",
      badgeColor: "purple",
      level: "Beginner",
      status: "published",
      order: 4,
    });

    // Security Fundamentals 2
    const sec2 = await TaskCourse.create({
      title: "Security Fundamentals 2",
      track: "Security Fundamentals",
      description:
        "Intermediate security techniques, access control, authentication methods, and security policies.",
      icon: "Lock",
      badgeColor: "rose",
      level: "Intermediate",
      status: "published",
      order: 5,
    });

    // Security Fundamentals 3
    const sec3 = await TaskCourse.create({
      title: "Security Fundamentals 3",
      track: "Security Fundamentals",
      description:
        "Advanced security strategies, threat modeling, security architecture, and defense-in-depth.",
      icon: "Users",
      badgeColor: "emerald",
      level: "Advanced",
      status: "published",
      order: 6,
    });

    // Chapters for Network Fundamentals 1 (from Image 2)
    const ch1 = await ChapterRoom.create({
      courseId: net1._id,
      roomNumber: "Room 01",
      title: "Network Overview",
      description:
        "Begin your journey into networking by understanding the core concepts of connectivity, explore how computers communicate, the basic components of a network, and the...",
      level: "Easy",
      estimatedTime: "45 minutes",
      xp: 100,
      icon: "Network",
      order: 1,
    });

    const ch2 = await ChapterRoom.create({
      courseId: net1._id,
      roomNumber: "Room 02",
      title: "Network Topologies",
      description:
        "Examine the physical and logical layouts of modern networks. Understand different architecture types like Star, Mesh, and Bus, and learn how topology choice impacts performance an...",
      level: "Easy",
      estimatedTime: "40 minutes",
      xp: 100,
      icon: "Share2",
      order: 2,
    });

    const ch3 = await ChapterRoom.create({
      courseId: net1._id,
      roomNumber: "Room 03",
      title: "Network Cabling",
      description:
        "Explore the physical layer of connectivity. Learn about different types of network media, including copper Ethernet cables and fiber optics, and understand the standards of physical...",
      level: "Easy",
      estimatedTime: "35 minutes",
      xp: 100,
      icon: "Cable",
      order: 3,
    });

    const ch4 = await ChapterRoom.create({
      courseId: net1._id,
      roomNumber: "Room 04",
      title: "Network Devices",
      description:
        "Understand routers, switches, access points, and firewalls that govern packet routing and network boundaries.",
      level: "Easy",
      estimatedTime: "50 minutes",
      xp: 100,
      icon: "Server",
      order: 4,
    });

    const ch5 = await ChapterRoom.create({
      courseId: net1._id,
      roomNumber: "Room 05",
      title: "OSI Model",
      description:
        "Master the 7-layer Open Systems Interconnection model that standardizes telecommunication and computer networking functions.",
      level: "Medium",
      estimatedTime: "60 minutes",
      xp: 100,
      icon: "Layers",
      order: 5,
    });

    const ch6 = await ChapterRoom.create({
      courseId: net1._id,
      roomNumber: "Room 06",
      title: "TCP/IP Model",
      description:
        "Dive deep into the four-layer protocol suite powering the global internet and packet-switched communication.",
      level: "Medium",
      estimatedTime: "55 minutes",
      xp: 100,
      icon: "Cpu",
      order: 6,
    });

    // Populate Tasks for Room 01: Network Overview (Exact content from Image 3!)
    await RoomTask.create([
      {
        courseId: net1._id,
        chapterId: ch1._id,
        taskNumber: "Task 1",
        title: "Task 1: Introduction",
        overview:
          "Have you ever wondered how your phone connects to the internet, how video calls reach your friends across the world, or how online games let you play with people everywhere? All of these amazing things are possible because of networks.",
        content: `Have you ever wondered how your phone connects to the internet, how video calls reach your friends across the world, or how online games let you play with people everywhere? All of these amazing things are possible because of networks. In our increasingly connected world, understanding networks is no longer just for tech experts it's essential knowledge for everyone.

This room is your friendly starting point into the world of networking. We'll explore what networks are, how they work, and why they matter in your daily life. Whether you're curious about technology, starting a career in IT, or just want to understand the digital world better, this room will give you the foundational knowledge you need.`,
        learningObjectives: [
          "Understand what a network is and why we need them",
          "Identify different types of networks and their purposes",
          "Learn how devices communicate across networks",
          "Recognize real-world network scenarios in daily life",
          "Build a solid foundation for more advanced networking topics",
        ],
        prerequisites: [
          "None! This is designed for complete beginners",
          "Basic computer or smartphone familiarity is helpful",
        ],
        questions: [
          {
            questionText: "What enables devices worldwide to exchange packets and communicate?",
            hint: "Starts with 'Computer' or 'Network'",
            correctAnswer: "Computer Networks",
            xp: 15,
          },
        ],
        xp: 20,
        order: 1,
      },
      {
        courseId: net1._id,
        chapterId: ch1._id,
        taskNumber: "Task 2",
        title: "Task 2: Components of a Network",
        overview: "Discover endpoints, transmission media, and intermediate network devices.",
        content: `A computer network is essentially a collection of computers, servers, mainframes, network devices, peripherals, or other devices connected to one another to allow the sharing of data.

Key components include:
1. **End Devices (Hosts)**: Computers, laptops, mobile phones, printers, and IoT devices that originate or consume network traffic.
2. **Intermediary Devices**: Hubs, switches, routers, and access points that facilitate the routing and switching of packets.
3. **Network Media**: The physical cabling (twisted pair copper cables, fiber optic glass) or wireless frequencies that carry signals.`,
        learningObjectives: [
          "Differentiate between host devices and intermediary devices",
          "Identify common transmission media (copper, fiber, wireless)",
          "Understand how packets travel between local hosts",
        ],
        prerequisites: ["Completion of Task 1"],
        questions: [
          {
            questionText: "Which device operates at Layer 2 to forward traffic within a local LAN?",
            hint: "Common enterprise networking hardware",
            correctAnswer: "Switch",
            xp: 15,
          },
        ],
        xp: 20,
        order: 2,
      },
      {
        courseId: net1._id,
        chapterId: ch1._id,
        taskNumber: "Task 3",
        title: "Task 3: Local Area Networks (LAN) vs Wide Area Networks (WAN)",
        overview: "Understand geographic classifications of computer networks.",
        content: `Networks are classified by their geographic reach and organizational structure:

- **LAN (Local Area Network)**: Connects computers within a limited geographical area such as a residence, school, laboratory, or office building.
- **WAN (Wide Area Network)**: Spans a large physical distance. The Internet is the most prominent and pervasive example of a public WAN.
- **MAN (Metropolitan Area Network)**: Spans a city or university campus.
- **PAN (Personal Area Network)**: Very small range around a single person (e.g., Bluetooth headphones connected to a phone).`,
        learningObjectives: [
          "Compare LAN, WAN, MAN, and PAN architectures",
          "Understand how local routers bridge LANs to the global WAN",
        ],
        prerequisites: ["Completion of Task 2"],
        questions: [
          {
            questionText: "What is the largest and most well-known example of a WAN?",
            hint: "The world wide web connectivity layer",
            correctAnswer: "Internet",
            xp: 15,
          },
        ],
        xp: 20,
        order: 3,
      },
      {
        courseId: net1._id,
        chapterId: ch1._id,
        taskNumber: "Task 4",
        title: "Task 4: IP Addressing & MAC Addresses",
        overview: "Logical addressing vs physical hardware addressing in networking.",
        content: `Every device on a network needs to be uniquely identifiable.

- **MAC Address (Media Access Control)**: A 48-bit unique hardware address burned into the Network Interface Card (NIC) at manufacture time. Example: \`00:1A:2B:3C:4D:5E\`.
- **IP Address (Internet Protocol)**: A logical address assigned to a host to allow routing across networks. IPv4 uses 32-bit dotted-decimal numbers (e.g. \`192.168.1.1\`), while IPv6 uses 128-bit hexadecimal strings.`,
        learningObjectives: [
          "Understand how MAC addresses function at Layer 2",
          "Understand how IP addresses function at Layer 3",
          "Recognize private vs public IP address spaces",
        ],
        prerequisites: ["Completion of Task 3"],
        questions: [
          {
            questionText: "How many bits are in a standard IPv4 address?",
            hint: "4 octets of 8 bits each",
            correctAnswer: "32",
            xp: 15,
          },
        ],
        xp: 20,
        order: 4,
      },
      {
        courseId: net1._id,
        chapterId: ch1._id,
        taskNumber: "Task 5",
        title: "Task 5: Domain Name System (DNS)",
        overview: "How human-friendly names resolve to machine-readable IP addresses.",
        content: `Computers communicate using IP numbers, but humans remember names like \`cybrixen.com\`.

The **Domain Name System (DNS)** acts as the phonebook of the internet. When you type a URL into your browser:
1. Your machine checks its local DNS cache.
2. If not found, it queries recursive resolvers and authoritative name servers.
3. The DNS server replies with the server's IP address (e.g., \`104.21.5.12\`).
4. Your browser connects to that IP to retrieve the web application.`,
        learningObjectives: [
          "Explain the end-to-end DNS resolution query flow",
          "Identify DNS record types (A, AAAA, CNAME, MX, TXT)",
        ],
        prerequisites: ["Completion of Task 4"],
        questions: [
          {
            questionText: "Which DNS record maps a domain name directly to an IPv4 address?",
            hint: "A single letter",
            correctAnswer: "A",
            xp: 15,
          },
        ],
        xp: 20,
        order: 5,
      },
      {
        courseId: net1._id,
        chapterId: ch1._id,
        taskNumber: "Task 6",
        title: "Task 6: Packets and Bandwidth",
        overview: "How data is broken down into chunks and transmitted across the wire.",
        content: `When transmitting large files or streaming video, data is divided into smaller units called **packets**.

Each packet contains:
- **Header**: Source IP, Destination IP, Protocol, Packet sequence number, and flags.
- **Payload**: The actual application data being transmitted.
- **Trailer / Checksum**: Error detection mechanism (like CRC) to verify the packet was not corrupted in transit.

Bandwidth refers to the maximum capacity of a network communication link, typically measured in Megabits per second (Mbps) or Gigabits per second (Gbps).`,
        learningObjectives: [
          "Understand the anatomy of a network packet",
          "Differentiate between bandwidth, throughput, and latency",
        ],
        prerequisites: ["Completion of Task 5"],
        questions: [
          {
            questionText: "What section of a packet contains the source and destination IP addresses?",
            hint: "The beginning metadata section",
            correctAnswer: "Header",
            xp: 15,
          },
        ],
        xp: 20,
        order: 6,
      },
      {
        courseId: net1._id,
        chapterId: ch1._id,
        taskNumber: "Task 7",
        title: "Task 7: Summary & Conclusion",
        overview: "Wrap up what you've learned and prepare for Network Topologies.",
        content: `Congratulations on completing Room 01: Network Overview!

You now have a firm grasp on:
- What networks are and why they exist.
- Network endpoints, intermediary appliances, and physical media.
- Local Area Networks vs Wide Area Networks.
- Hardware MAC addresses vs logical IP addresses.
- The Domain Name System (DNS) translation workflow.
- How packets flow across switches and routers.

In the next room (**Room 02: Network Topologies**), you will explore the architectural design patterns used in enterprise topologies, including Star, Mesh, Bus, and Ring topologies.`,
        learningObjectives: [
          "Review key terminology and foundational takeaways",
          "Unlock Room 02: Network Topologies and earn the Room Completion Badge",
        ],
        prerequisites: ["Completion of Tasks 1 through 6"],
        questions: [
          {
            questionText: "Ready to proceed to Network Topologies? Enter 'ready' to complete this room.",
            hint: "Type 'ready'",
            correctAnswer: "ready",
            xp: 25,
          },
        ],
        xp: 25,
        order: 7,
      },
    ]);

    // Also populate initial tasks for Room 02: Network Topologies
    await RoomTask.create([
      {
        courseId: net1._id,
        chapterId: ch2._id,
        taskNumber: "Task 1",
        title: "Task 1: Introduction to Topologies",
        overview: "Explore physical vs logical topologies.",
        content: `Network topology refers to the topological structure of a computer network. It defines how different nodes, devices, and connections are situated in relation to each other.

There are two primary categories of topology:
1. **Physical Topology**: The actual geometric arrangement of cables, wires, and devices in physical space.
2. **Logical Topology**: The conceptual path that data signals follow through the network from one point to another regardless of physical layout.`,
        learningObjectives: [
          "Understand the difference between physical and logical topology",
          "Evaluate how topology selection affects fault tolerance and cabling cost",
        ],
        prerequisites: ["Completion of Room 01"],
        questions: [
          {
            questionText: "Which topology defines the conceptual path data signals travel?",
            hint: "Logical or Physical?",
            correctAnswer: "Logical",
            xp: 15,
          },
        ],
        xp: 20,
        order: 1,
      },
      {
        courseId: net1._id,
        chapterId: ch2._id,
        taskNumber: "Task 2",
        title: "Task 2: Star Topology",
        overview: "The most common enterprise local area network layout.",
        content: `In a **Star Topology**, every host device is connected to a central hub, switch, or concentrator via point-to-point connections.

Advantages:
- Easy to install and wire.
- If one cable or host fails, only that host is affected; the rest of the network remains operational.
- Easy to detect faults and isolate components.

Disadvantages:
- The central device represents a single point of failure. If the central switch fails, the whole segment goes down.
- Requires more cable length than bus topology.`,
        learningObjectives: [
          "Understand the star topology design pattern",
          "Identify advantages and failure modes of central switch configurations",
        ],
        prerequisites: ["Completion of Task 1"],
        questions: [
          {
            questionText: "What represents the single point of failure in a star topology?",
            hint: "The middle hardware component",
            correctAnswer: "Central Switch",
            xp: 15,
          },
        ],
        xp: 20,
        order: 2,
      },
    ]);

    res.status(201).json({
      message: "Sample curriculum reference data successfully seeded!",
      coursesCreated: 6,
      chaptersCreated: 6,
      tasksCreated: 9,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to seed reference data", error: error.message });
  }
};
