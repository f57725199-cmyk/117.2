
import { ClassLevel, ClassSyllabus, TopicDetail, DayPlan, SubjectContent } from './types';

const t = (name: string, hours: number, days: number): TopicDetail => ({ name, hours, days });

/**
 * Intelligent Daily Schedule Generator
 * Distributes 6 hours of study among available subjects.
 */
const generateDailySchedule = (content: SubjectContent[]): DayPlan[] => {
  const schedule: DayPlan[] = [];
  
  // Group topics by subject categories
  const subjectsPool: Record<string, TopicDetail[]> = {};
  content.forEach(sub => {
    if (!subjectsPool[sub.subjectName]) subjectsPool[sub.subjectName] = [];
    subjectsPool[sub.subjectName].push(...sub.topics);
  });

  const availableSubjects = Object.keys(subjectsPool);
  const subjectCount = availableSubjects.length;
  
  // Calculate hours per subject (Targeting 6 hours total)
  const hoursPerSubject = subjectCount > 0 ? 6 / subjectCount : 6;

  for (let day = 1; day <= 30; day++) {
    const dailyTasks: any[] = [];
    
    availableSubjects.forEach(subName => {
      const pool = subjectsPool[subName];
      if (pool && pool.length > 0) {
        const topic = pool[(day - 1) % pool.length];
        dailyTasks.push({ 
          topic: topic.name, 
          hours: parseFloat(hoursPerSubject.toFixed(1)), 
          subject: subName 
        });
      }
    });

    if (dailyTasks.length === 0) {
      dailyTasks.push({ topic: "General Revision | सामान्य पुनरावृत्ति", hours: 6, subject: "Self Study" });
    }

    schedule.push({ day, tasks: dailyTasks });
  }

  return schedule;
};

const generateMonth12Plan = (classLevel: string) => {
  const plans: Record<string, string[]> = {
    '9': ["Day 1: Number Systems Mastery | संख्या पद्धति", "Day 2: Polynomials | बहुपद", "Day 3: Linear Equations | रैखिक समीकरण", "Day 4: Coordinate Geometry | निर्देशांक ज्यामिति", "Day 5: Lines & Angles | रेखाएँ और कोण", "Day 18: Physics - Motion Recap | गति", "Day 23: Chemistry - Matter States | पदार्थ की अवस्थाएं", "Day 27: Biology - Cell & Tissues | कोशिका और ऊतक"],
    '10': ["Day 1: Real Numbers Recap | वास्तविक संख्याएँ", "Day 2: Polynomials | बहुपद", "Day 4: Quadratic Equations | द्विघात समीकरण", "Day 16: Physics - Reflection | परावर्तन", "Day 19: Physics - Electricity | विद्युत", "Day 21: Chemistry - Reactions | रासायनिक अभिक्रियाएं", "Day 26: Biology - Life Processes | जैव प्रक्रम"],
    '11': ["Day 1: Sets & Relations | समुच्चय और संबंध", "Day 14: Physics - Units & Motion | मात्रक और गति", "Day 23: Chem - Basic Concepts | रसायन विज्ञान की मूल अवधारणाएं", "Day 26: Chem - Organic Basics | कार्बनिक रसायन"],
    '12': ["Day 1: Relations & Functions | संबंध और फलन", "Day 14: Physics - Electrostatics | स्थिरवैद्युतिकी", "Day 22: Chem - Solutions | विलयन", "Day 29: Chem - Biomolecules | जैव-अणु"]
  };
  return plans[classLevel] || plans['10'];
};

const createMonth = (m: number, desc: string, content: SubjectContent[], color: string = "text-green-500"): any => ({
  month: m,
  label: `MONTH ${m}`,
  description: desc,
  color,
  status: m === 1 ? 'active' : 'locked',
  content,
  dailySchedule: generateDailySchedule(content)
});

export const INITIAL_SYLLABUS_DATA: Record<ClassLevel, ClassSyllabus> = {
  [ClassLevel.CLASS_9]: {
    classLevel: ClassLevel.CLASS_9,
    goal: "365 Days Mastery Protocol (Bilingual)",
    rules: ["6 Hours Daily Self-Study", "Mathematics: Revision Focus", "Science/SST: Practice", "Sunday: Mega Revision Day (No New Tasks)", "Rule: M(N) includes Revision of M(N-1)"],
    months: [
      createMonth(1, "FOUNDATION | आधारशिला", [
        { subjectName: "Maths", icon: "📐", topics: [t("Number Systems | संख्या पद्धति", 20, 10), t("Polynomials | बहुपद", 15, 8)] },
        { subjectName: "Science", icon: "🔬", topics: [t("Motion | गति", 30, 15), t("Matter in Surroundings | हमारे आस-पास के पदार्थ", 25, 15)] },
        { subjectName: "SST", icon: "🌍", topics: [t("French Revolution | फ्रांसीसी क्रांति", 20, 10), t("India: Size & Location | भारत: आकार और स्थिति", 15, 8)] }
      ]),
      createMonth(2, "M1 REVISION + PROGRESS | M1 पुनरावृत्ति", [
        { subjectName: "Maths", icon: "📐", topics: [t("Coordinate Geometry | निर्देशांक ज्यामिति", 20, 10)] },
        { subjectName: "Science", icon: "🔬", topics: [t("Force & Laws of Motion | बल और गति के नियम", 30, 15)] },
        { subjectName: "SST", icon: "🌍", topics: [t("Socialism in Europe | यूरोप में समाजवाद", 20, 10)] },
        { subjectName: "Revision (M1)", icon: "🔄", topics: [t("M1: Maths & Science Recap", 30, 15), t("M1: SST Revision", 15, 15)] }
      ], "text-yellow-500"),
      ...[3,4,5,6,7,8,9,10,11].map(m => createMonth(m, "Course Progress + Previous Month Revision", [
        { subjectName: "Maths", icon: "📐", topics: [t("Core Topics | मुख्य विषय", 30, 10)] },
        { subjectName: "Science", icon: "🧪", topics: [t("Science Concepts | विज्ञान अवधारणाएं", 30, 10)] },
        { subjectName: "SST", icon: "🌍", topics: [t("Social Progress | सामाजिक प्रगति", 30, 10)] },
        { subjectName: `Revision (M${m-1})`, icon: "🔄", topics: [t(`M${m-1} Full Revision & MCQs`, 30, 10)] }
      ], "text-yellow-500")),
      { ...createMonth(12, "FINAL REVISION | अंतिम पुनरावृत्ति", [], "text-red-500"), dailyRevisionPlan: generateMonth12Plan('9') }
    ]
  },
  [ClassLevel.CLASS_10]: {
    classLevel: ClassLevel.CLASS_10,
    goal: "Board 100% Mastery (Bilingual)",
    rules: ["6 Hours Daily Self-Study", "Mathematics: No MCQ - Revision Only", "Science/SST: Compulsory Practice", "Sunday: Mega Revision Protocol", "Rule: M(N) includes Revision/MCQ of M(N-1)"],
    months: [
      createMonth(1, "BOARD FOUNDATION | बोर्ड आधार", [
        { subjectName: "Maths", icon: "📐", topics: [t("Real Numbers | वास्तविक संख्याएँ", 20, 10), t("Polynomials | बहुपद", 15, 8)] },
        { subjectName: "Science", icon: "🔬", topics: [t("Chemical Reactions | रासायनिक अभिक्रियाएं", 30, 15), t("Life Processes | जैव प्रक्रम", 30, 15)] },
        { subjectName: "SST", icon: "🌍", topics: [t("Nationalism in Europe | यूरोप में राष्ट्रवाद", 20, 10), t("Power Sharing | सत्ता की साझेदारी", 15, 8)] }
      ]),
      createMonth(2, "M1 REVISION + NEW TOPICS", [
        { subjectName: "Maths", icon: "📐", topics: [t("Pair of Linear Equations | रैखिक समीकरण युग्म", 30, 15)] },
        { subjectName: "Science", icon: "🔬", topics: [t("Acids, Bases & Salts | अम्ल, क्षारक और लवण", 30, 15)] },
        { subjectName: "SST", icon: "🌍", topics: [t("Nationalism in India | भारत में राष्ट्रवाद", 30, 15)] },
        { subjectName: "Revision (M1)", icon: "🔄", topics: [t("M1 All Subjects Revision", 30, 15), t("M1 Science/SST MCQs", 30, 15)] }
      ], "text-yellow-500"),
      ...[3,4,5,6,7,8,9,10,11].map(m => createMonth(m, "Board Protocol + Previous Month Mastery", [
        { subjectName: "Maths", icon: "📐", topics: [t("Trigonometry | त्रिकोणमिति", 30, 10)] },
        { subjectName: "Science", icon: "🧪", topics: [t("Carbon Compounds | कार्बन यौगिक", 30, 10)] },
        { subjectName: "SST", icon: "🌍", topics: [t("Political Parties | राजनीतिक दल", 30, 10)] },
        { subjectName: `Revision (M${m-1})`, icon: "🔄", topics: [t(`M${m-1} Final Revision & MCQ Drill`, 30, 10)] }
      ], "text-yellow-500")),
      { ...createMonth(12, "BOARD VICTORY | बोर्ड विजय", [], "text-red-500"), dailyRevisionPlan: generateMonth12Plan('10') }
    ]
  },
  [ClassLevel.CLASS_11]: {
    classLevel: ClassLevel.CLASS_11,
    goal: "Pure Science Stream (PCMB Only)",
    rules: ["6 Hours Daily Self-Study", "Mathematics: Revision Focus", "Physics/Chem/Bio: Practice", "Sunday: Mega Revision Protocol", "Rule: M(N) includes Revision/MCQ of M(N-1)"],
    months: [
      createMonth(1, "CORE SCIENCE START | मुख्य विज्ञान प्रारंभ", [
        { subjectName: "Maths", icon: "📐", topics: [t("Sets & Relations | समुच्चय और संबंध", 30, 10)] },
        { subjectName: "Physics", icon: "🔬", topics: [t("Units & Measurement | मात्रक और मापन", 20, 5), t("Motion | गति", 30, 10)] },
        { subjectName: "Chemistry", icon: "🧪", topics: [t("Basic Concepts | मूल अवधारणाएं", 25, 10), t("Atomic Structure | परमाणु संरचना", 35, 10)] },
        { subjectName: "Biology", icon: "🧬", topics: [t("Classification | वर्गीकरण", 30, 15)] }
      ]),
      createMonth(2, "M1 MASTERY + NEW SCIENCE", [
        { subjectName: "Physics", icon: "🔬", topics: [t("Laws of Motion | गति के नियम", 40, 20)] },
        { subjectName: "Maths", icon: "📐", topics: [t("Functions | फलन", 20, 10)] },
        { subjectName: "Revision (M1)", icon: "🔄", topics: [t("M1 PCMB Full Review", 30, 15), t("M1 PCB MCQ Session", 30, 15)] }
      ], "text-yellow-500"),
      ...[3,4,5,6,7,8,9,10,11].map(m => createMonth(m, "Science Progression + M-1 Revision", [
        { subjectName: "Maths", icon: "📐", topics: [t("Algebra | बीजगणित", 30, 10)] },
        { subjectName: "Physics", icon: "🔬", topics: [t("Mechanics | यांत्रिकी", 30, 10)] },
        { subjectName: "Chemistry", icon: "🧪", topics: [t("Bonding | बंधन", 30, 10)] },
        { subjectName: "Biology", icon: "🧬", topics: [t("Physiology | शरीर विज्ञान", 30, 10)] },
        { subjectName: `Revision (M${m-1})`, icon: "🔄", topics: [t(`M${m-1} PCMB Detailed Review`, 30, 10)] }
      ], "text-yellow-500")),
      { ...createMonth(12, "FINAL REVISION | अंतिम पुनरावृत्ति", [], "text-red-500"), dailyRevisionPlan: generateMonth12Plan('11') }
    ]
  },
  [ClassLevel.CLASS_12]: {
    classLevel: ClassLevel.CLASS_12,
    goal: "Board 95% Target (PCMB Only)",
    rules: ["6 Hours Daily Self-Study", "Mathematics: Formula Revision", "Physics/Chem/Bio: Practice", "Sunday: Mega Revision Protocol", "Rule: M(N) includes Revision/MCQ of M-1"],
    months: [
      createMonth(1, "BOARD SCIENCE START | बोर्ड विज्ञान प्रारंभ", [
        { subjectName: "Maths", icon: "📐", topics: [t("Relations & Functions | संबंध और फलन", 25, 10)] },
        { subjectName: "Physics", icon: "🔬", topics: [t("Electrostatics | स्थिरवैद्युतिकी", 35, 15)] },
        { subjectName: "Chemistry", icon: "🧪", topics: [t("Solutions | विलयन", 30, 10), t("Electrochemistry | वैद्युतरसायन", 40, 15)] },
        { subjectName: "Biology", icon: "🧬", topics: [t("Reproduction | प्रजनन", 35, 15)] }
      ]),
      createMonth(2, "M1 REVISION + BOARD TOPICS", [
        { subjectName: "Physics", icon: "🔬", topics: [t("Current Electricity | विद्युत धारा", 40, 20)] },
        { subjectName: "Chemistry", icon: "🧪", topics: [t("Chemical Kinetics | रासायनिक बलगतिकी", 30, 15)] },
        { subjectName: "Revision (M1)", icon: "🔄", topics: [t("M1 PCMB Board Practice", 30, 15), t("M1 PCB MCQ Drill", 30, 15)] }
      ], "text-yellow-500"),
      ...[3,4,5,6,7,8,9,10,11].map(m => createMonth(m, "Final Boards + M-1 Revision", [
        { subjectName: "Maths", icon: "📐", topics: [t("Calculus | कलन", 40, 10)] },
        { subjectName: "Physics", icon: "🔬", topics: [t("Optics | प्रकाशिकी", 40, 10)] },
        { subjectName: "Chemistry", icon: "🧪", topics: [t("Organic | कार्बनिक", 40, 10)] },
        { subjectName: "Biology", icon: "🧬", topics: [t("Genetics | आनुवंशिकी", 40, 10)] },
        { subjectName: `Revision (M${m-1})`, icon: "🔄", topics: [t(`M${m-1} Previous Month Content`, 30, 10)] }
      ], "text-yellow-500")),
      { ...createMonth(12, "BOARD FINAL DRILL | बोर्ड अभ्यास", [], "text-red-500"), dailyRevisionPlan: generateMonth12Plan('12') }
    ]
  }
};
