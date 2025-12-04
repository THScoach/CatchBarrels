import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const drillCourses = [
  {
    title: "Swing Mechanics Fundamentals",
    description: "Master the core mechanics of an elite baseball swing - from stance to finish",
    category: "Swing Mechanics",
    visibility: "athlete" as const,
    contentType: "training" as const,
    modules: [
      {
        title: "Stance & Stride Basics",
        description: "Build a consistent, powerful foundation for your swing",
        order: 1,
        lessons: [
          {
            title: "Stance & Stride",
            description: "Proper stance setup and stride mechanics for timing and balance",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Stance & Stride Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Weight Shift & Transfer",
            description: "How to efficiently transfer weight from back to front for maximum power",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Weight Shift & Transfer Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      },
      {
        title: "Sequencing & Timing",
        description: "Perfect the sequence of movements for consistent, powerful contact",
        order: 2,
        lessons: [
          {
            title: "Sequencing Tee Drill",
            description: "Develop proper kinetic chain sequencing with tee work",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Sequencing Tee Drill Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Top Hand Halfway Home",
            description: "Train proper hand path and barrel control through contact zone",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Top Hand Halfway Home Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      }
    ]
  },
  {
    title: "Hip & Rotational Power Development",
    description: "Unlock explosive rotational power through proper hip mechanics and core engagement",
    category: "Power Development",
    visibility: "athlete" as const,
    contentType: "training" as const,
    modules: [
      {
        title: "Hip Mechanics Mastery",
        description: "Train the engine of your swing - hip loading and rotation",
        order: 1,
        lessons: [
          {
            title: "Back Hip Jump Back to Rotational Hip",
            description: "Learn proper back hip loading and transition to rotation",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Back Hip Jump Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Back Hip Co-Contraction Water Ball Swing",
            description: "Build back hip stability and engagement with weighted implements",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Back Hip Co-Contraction Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Front Hip Co-Contraction on Slant",
            description: "Develop front hip bracing for maximum energy transfer",
            lessonType: "video" as const,
            order: 3,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Front Hip Co-Contraction Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      },
      {
        title: "Rotational Power Drills",
        description: "Advanced rotational training for explosive bat speed",
        order: 2,
        lessons: [
          {
            title: "Med Ball Swing",
            description: "Build rotational power and core strength with med ball training",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Med Ball Swing Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Lateral Tilt Training",
            description: "Master the proper lateral tilt for adjusting to pitch height",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Lateral Tilt Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Reverse Swings with Rope",
            description: "Train rotational awareness and deceleration mechanics",
            lessonType: "video" as const,
            order: 3,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Reverse Swings Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      }
    ]
  },
  {
    title: "Driveline Baseball Training System",
    description: "Evidence-based constraint drills from the Driveline Baseball hitting program",
    category: "Driveline Training",
    visibility: "athlete" as const,
    contentType: "training" as const,
    modules: [
      {
        title: "Constraint-Based Drills",
        description: "Strategic constraints that force optimal movement patterns",
        order: 1,
        lessons: [
          {
            title: "Launch Angle Ladder",
            description: "Train adjustability to different pitch heights with progressive constraints",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Launch Angle Ladder Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Hook 'Em Drill",
            description: "Develop inside hand path and barrel control to the pull side",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Hook 'Em Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Offset Open Drill",
            description: "Train against early opening with open stance constraint",
            lessonType: "video" as const,
            order: 3,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Offset Open Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Offset Closed Drill",
            description: "Address diving or pulling off pitches with closed stance constraint",
            lessonType: "video" as const,
            order: 4,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Offset Closed Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Kershaw Hitting Drill",
            description: "Train against breaking balls and back-door pitches",
            lessonType: "video" as const,
            order: 5,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Kershaw Drill Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      }
    ]
  },
  {
    title: "Mental Game & Distraction Control",
    description: "Train focus, concentration, and mental resilience in the batter's box",
    category: "Mental Performance",
    visibility: "athlete" as const,
    contentType: "training" as const,
    modules: [
      {
        title: "Distraction Control Series",
        description: "Progressive training system to build unshakeable focus at the plate",
        order: 1,
        lessons: [
          {
            title: "2.1 Distraction Control Intro",
            description: "Introduction to distraction control training and its importance for hitting",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Distraction Control Intro Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "2.2 Distraction Control Set-up",
            description: "How to properly set up distraction control training environments",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Distraction Control Setup Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "2.3 Distraction Control Drill Part 1",
            description: "Level 1 distraction training - visual distractions",
            lessonType: "video" as const,
            order: 3,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Distraction Control P1 Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "2.4 Distraction Control Drill Part 2",
            description: "Level 2 distraction training - auditory distractions",
            lessonType: "video" as const,
            order: 4,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Distraction Control P2 Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "2.5 Distraction Control Drill Part 3",
            description: "Level 3 distraction training - combined distractions",
            lessonType: "video" as const,
            order: 5,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Distraction Control P3 Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "2.6 Distraction Control Drill Part 4",
            description: "Level 4 distraction training - high-pressure scenarios",
            lessonType: "video" as const,
            order: 6,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Distraction Control P4 Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "2.7 Distraction Control Drill Close",
            description: "Final application and integration of distraction control skills",
            lessonType: "video" as const,
            order: 7,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Distraction Control Close Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      }
    ]
  },
  {
    title: "Stability & Balance Training",
    description: "Build a rock-solid foundation with stability and balance drills",
    category: "Fundamentals",
    visibility: "athlete" as const,
    contentType: "training" as const,
    modules: [
      {
        title: "Stability Fundamentals",
        description: "Core stability exercises for consistent swing mechanics",
        order: 1,
        lessons: [
          {
            title: "Stability Drill 1",
            description: "Foundation stability training for lower body control",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Stability Drill Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Bosu Ball Swings",
            description: "Train dynamic stability and balance through unstable surface work",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Bosu Ball Swings Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Bearhugs Drill",
            description: "Build core and upper body stability for maintaining posture",
            lessonType: "video" as const,
            order: 3,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Bearhugs Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      },
      {
        title: "Med Ball Core Training",
        description: "Medicine ball exercises for rotational power and core strength",
        order: 2,
        lessons: [
          {
            title: "Med Ball Squeeze",
            description: "Train core compression and upper body connection",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Med Ball Squeeze Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Sitting Med Ball Push",
            description: "Isolated rotational power training from seated position",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Sitting Med Ball Push Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Sitting Pelvic Thoracic Separation",
            description: "Develop elite separation between hips and shoulders",
            lessonType: "video" as const,
            order: 3,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Pelvic Thoracic Separation Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      }
    ]
  },
  {
    title: "Advanced Technique Drills",
    description: "High-level drills for refining specific technical elements",
    category: "Advanced Training",
    visibility: "athlete" as const,
    contentType: "training" as const,
    modules: [
      {
        title: "Arm Extension & Path",
        description: "Dial in optimal bat path and extension through contact",
        order: 1,
        lessons: [
          {
            title: "Extension of the Trail Arm",
            description: "Train proper extension and finish for maximum power transfer",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Trail Arm Extension Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Jackhammer Drill",
            description: "Develop direct, powerful hand path to the ball",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Jackhammer Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      },
      {
        title: "Specialized Drills",
        description: "Targeted drills for specific swing adjustments",
        order: 2,
        lessons: [
          {
            title: "Jump Up Drill",
            description: "Train explosive lower body engagement and timing",
            lessonType: "video" as const,
            order: 1,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Jump Up Drill Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "Forward Press",
            description: "Learn the subtle trigger movement used by elite hitters",
            lessonType: "video" as const,
            order: 2,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "Forward Press Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          },
          {
            title: "OH Drill",
            description: "Advanced drill for overhand bat path training",
            lessonType: "video" as const,
            order: 3,
            sourceUrl: "https://app.membership.io/...",
            assets: [{
              title: "OH Drill Video",
              assetType: "video" as const,
              originalUrl: "https://app.membership.io/..."
            }]
          }
        ]
      }
    ]
  }
];

async function importDrills() {
  console.log('Starting drill import...');
  
  let coursesImported = 0;
  let modulesImported = 0;
  let lessonsImported = 0;
  let assetsImported = 0;

  for (const courseData of drillCourses) {
    console.log(`\nImporting course: ${courseData.title}`);
    
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        visibility: courseData.visibility,
        contentType: courseData.contentType,
        importedAt: new Date(),
      },
    });
    
    coursesImported++;
    console.log(`✓ Course created: ${course.title}`);

    for (const moduleData of courseData.modules) {
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.order,
        },
      });
      
      modulesImported++;
      console.log(`  ✓ Module created: ${module.title}`);

      for (const lessonData of moduleData.lessons) {
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: lessonData.title,
            description: lessonData.description,
            lessonType: lessonData.lessonType,
            order: lessonData.order,
            sourceUrl: lessonData.sourceUrl,
          },
        });
        
        lessonsImported++;
        console.log(`    ✓ Lesson created: ${lesson.title}`);

        for (const assetData of lessonData.assets) {
          await prisma.contentAsset.create({
            data: {
              lessonId: lesson.id,
              title: assetData.title,
              assetType: assetData.assetType,
              originalUrl: assetData.originalUrl,
            },
          });
          
          assetsImported++;
        }
      }
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Courses imported: ${coursesImported}`);
  console.log(`Modules imported: ${modulesImported}`);
  console.log(`Lessons imported: ${lessonsImported}`);
  console.log(`Assets imported: ${assetsImported}`);
  
  await prisma.$disconnect();
}

importDrills().catch((error) => {
  console.error('Error importing drills:', error);
  process.exit(1);
});
