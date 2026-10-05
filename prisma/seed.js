const { PrismaClient, UserRole, Gender, DayOfWeek } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const argon2 = require("argon2");

require("dotenv").config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // --------------------------------------------------
  // PASSWORD
  // --------------------------------------------------

  const passwordHash = await argon2.hash("Password@123");

  // --------------------------------------------------
  // DEPARTMENTS
  // --------------------------------------------------

  const cardiology = await prisma.department.upsert({
    where: {
      name: "Cardiology",
    },
    update: {},
    create: {
      name: "Cardiology",
      description: "Department dealing with heart and cardiovascular diseases.",
    },
  });

  const gynaecology = await prisma.department.upsert({
    where: {
      name: "Gynaecology",
    },
    update: {},
    create: {
      name: "Gynaecology",
      description: "Department dealing with women's reproductive health.",
    },
  });

  const neurology = await prisma.department.upsert({
    where: {
      name: "Neurology",
    },
    update: {},
    create: {
      name: "Neurology",
      description: "Department dealing with the nervous system.",
    },
  });

  const orthopaedics = await prisma.department.upsert({
    where: {
      name: "Orthopaedics",
    },
    update: {},
    create: {
      name: "Orthopaedics",
      description: "Department dealing with bones, joints and muscles.",
    },
  });

  const generalMedicine = await prisma.department.upsert({
    where: {
      name: "General Medicine",
    },
    update: {},
    create: {
      name: "General Medicine",
      description: "General medical diagnosis and treatment.",
    },
  });

  console.log("✅ Departments created");

  // --------------------------------------------------
  // HOSPITALS
  // --------------------------------------------------

  const kmc = await prisma.hospital.create({
    data: {
      name: "KMC Hospital",
      address: "Dr. B R Ambedkar Circle",
      city: "Mangaluru",
      state: "Karnataka",
      postalCode: "575001",
      phone: "0824-2222111",
      email: "contact@kmchospital.com",
      description: "Multi-speciality hospital.",
    },
  });

  const apollo = await prisma.hospital.create({
    data: {
      name: "Apollo Hospital",
      address: "Bannerghatta Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560076",
      phone: "080-26304050",
      email: "contact@apollo.example",
      description: "Multi-speciality hospital.",
    },
  });

  const cityCare = await prisma.hospital.create({
    data: {
      name: "City Care Hospital",
      address: "MG Road",
      city: "Mangaluru",
      state: "Karnataka",
      postalCode: "575003",
      phone: "0824-2456789",
      email: "contact@citycare.example",
      description: "Community healthcare hospital.",
    },
  });

  console.log("✅ Hospitals created");

  // --------------------------------------------------
  // HOSPITAL ↔ DEPARTMENT
  // --------------------------------------------------

  await prisma.hospitalDepartment.createMany({
    data: [
      {
        hospitalId: kmc.id,
        departmentId: cardiology.id,
      },
      {
        hospitalId: kmc.id,
        departmentId: neurology.id,
      },
      {
        hospitalId: kmc.id,
        departmentId: orthopaedics.id,
      },
      {
        hospitalId: kmc.id,
        departmentId: generalMedicine.id,
      },

      {
        hospitalId: apollo.id,
        departmentId: cardiology.id,
      },
      {
        hospitalId: apollo.id,
        departmentId: gynaecology.id,
      },
      {
        hospitalId: apollo.id,
        departmentId: neurology.id,
      },
      {
        hospitalId: apollo.id,
        departmentId: generalMedicine.id,
      },

      {
        hospitalId: cityCare.id,
        departmentId: gynaecology.id,
      },
      {
        hospitalId: cityCare.id,
        departmentId: orthopaedics.id,
      },
      {
        hospitalId: cityCare.id,
        departmentId: generalMedicine.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Hospital departments created");

  // --------------------------------------------------
  // HOSPITAL TIMINGS
  // --------------------------------------------------

  const hospitalTimings = [];

  const hospitals = [kmc, apollo, cityCare];

  for (const hospital of hospitals) {
    hospitalTimings.push(
      {
        hospitalId: hospital.id,
        dayOfWeek: DayOfWeek.MONDAY,
        openingTime: "09:00",
        closingTime: "18:00",
        isClosed: false,
      },
      {
        hospitalId: hospital.id,
        dayOfWeek: DayOfWeek.TUESDAY,
        openingTime: "09:00",
        closingTime: "18:00",
        isClosed: false,
      },
      {
        hospitalId: hospital.id,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        openingTime: "09:00",
        closingTime: "18:00",
        isClosed: false,
      },
      {
        hospitalId: hospital.id,
        dayOfWeek: DayOfWeek.THURSDAY,
        openingTime: "09:00",
        closingTime: "18:00",
        isClosed: false,
      },
      {
        hospitalId: hospital.id,
        dayOfWeek: DayOfWeek.FRIDAY,
        openingTime: "09:00",
        closingTime: "18:00",
        isClosed: false,
      },
      {
        hospitalId: hospital.id,
        dayOfWeek: DayOfWeek.SATURDAY,
        openingTime: "09:00",
        closingTime: "14:00",
        isClosed: false,
      },
      {
        hospitalId: hospital.id,
        dayOfWeek: DayOfWeek.SUNDAY,
        openingTime: "00:00",
        closingTime: "00:00",
        isClosed: true,
      }
    );
  }

  await prisma.hospitalTiming.createMany({
    data: hospitalTimings,
    skipDuplicates: true,
  });

  console.log("✅ Hospital timings created");

  // --------------------------------------------------
  // ADMIN
  // --------------------------------------------------

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@healdoor.com",
    },
    update: {},
    create: {
      name: "HEAL DOOR Admin",
      email: "admin@healdoor.com",
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // --------------------------------------------------
  // DOCTOR USERS
  // --------------------------------------------------

  const doctorRahulUser = await prisma.user.upsert({
    where: {
      email: "rahul@healdoor.com",
    },
    update: {},
    create: {
      name: "Dr. Rahul Sharma",
      email: "rahul@healdoor.com",
      passwordHash,
      role: UserRole.DOCTOR,
      emailVerified: true,
    },
  });

  const doctorPriyaUser = await prisma.user.upsert({
    where: {
      email: "priya@healdoor.com",
    },
    update: {},
    create: {
      name: "Dr. Priya Rao",
      email: "priya@healdoor.com",
      passwordHash,
      role: UserRole.DOCTOR,
      emailVerified: true,
    },
  });

  const doctorAnanyaUser = await prisma.user.upsert({
    where: {
      email: "ananya@healdoor.com",
    },
    update: {},
    create: {
      name: "Dr. Ananya Iyer",
      email: "ananya@healdoor.com",
      passwordHash,
      role: UserRole.DOCTOR,
      emailVerified: true,
    },
  });

  const doctorArjunUser = await prisma.user.upsert({
    where: {
      email: "arjun@healdoor.com",
    },
    update: {},
    create: {
      name: "Dr. Arjun Kumar",
      email: "arjun@healdoor.com",
      passwordHash,
      role: UserRole.DOCTOR,
      emailVerified: true,
    },
  });

  const doctorSnehaUser = await prisma.user.upsert({
    where: {
      email: "sneha@healdoor.com",
    },
    update: {},
    create: {
      name: "Dr. Sneha Nair",
      email: "sneha@healdoor.com",
      passwordHash,
      role: UserRole.DOCTOR,
      emailVerified: true,
    },
  });

  console.log("✅ Doctor users created");

  // --------------------------------------------------
  // DOCTOR PROFILES
  // --------------------------------------------------

  const rahul = await prisma.doctor.upsert({
    where: {
      userId: doctorRahulUser.id,
    },
    update: {},
    create: {
      userId: doctorRahulUser.id,
      hospitalId: kmc.id,
      departmentId: cardiology.id,
      licenseNumber: "KA-CARD-1001",
      specialization: "Interventional Cardiology",
      qualification: "MD, DM Cardiology",
      experienceYears: 12,
      bio: "Experienced cardiologist specializing in cardiovascular care.",
      consultationFee: 800,
    },
  });

  const priya = await prisma.doctor.upsert({
    where: {
      userId: doctorPriyaUser.id,
    },
    update: {},
    create: {
      userId: doctorPriyaUser.id,
      hospitalId: apollo.id,
      departmentId: gynaecology.id,
      licenseNumber: "KA-GYN-1002",
      specialization: "Obstetrics and Gynaecology",
      qualification: "MBBS, MD",
      experienceYears: 10,
      bio: "Specialist in women's health and pregnancy care.",
      consultationFee: 700,
    },
  });

  const ananya = await prisma.doctor.upsert({
    where: {
      userId: doctorAnanyaUser.id,
    },
    update: {},
    create: {
      userId: doctorAnanyaUser.id,
      hospitalId: kmc.id,
      departmentId: neurology.id,
      licenseNumber: "KA-NEU-1003",
      specialization: "Clinical Neurology",
      qualification: "MBBS, MD Neurology",
      experienceYears: 8,
      bio: "Neurologist specializing in neurological disorders.",
      consultationFee: 750,
    },
  });

  const arjun = await prisma.doctor.upsert({
    where: {
      userId: doctorArjunUser.id,
    },
    update: {},
    create: {
      userId: doctorArjunUser.id,
      hospitalId: cityCare.id,
      departmentId: orthopaedics.id,
      licenseNumber: "KA-ORT-1004",
      specialization: "Orthopaedic Surgery",
      qualification: "MBBS, MS Orthopaedics",
      experienceYears: 9,
      bio: "Orthopaedic specialist focusing on bone and joint conditions.",
      consultationFee: 650,
    },
  });

  const sneha = await prisma.doctor.upsert({
    where: {
      userId: doctorSnehaUser.id,
    },
    update: {},
    create: {
      userId: doctorSnehaUser.id,
      hospitalId: apollo.id,
      departmentId: generalMedicine.id,
      licenseNumber: "KA-GEN-1005",
      specialization: "General Medicine",
      qualification: "MBBS, MD",
      experienceYears: 7,
      bio: "General physician providing comprehensive medical care.",
      consultationFee: 500,
    },
  });

  console.log("✅ Doctor profiles created");

  // --------------------------------------------------
  // DOCTOR AVAILABILITY
  // --------------------------------------------------

  const doctors = [rahul, priya, ananya, arjun, sneha];

  for (const doctor of doctors) {
    await prisma.doctorAvailability.createMany({
      data: [
        {
          doctorId: doctor.id,
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: "09:00",
          endTime: "13:00",
          slotDuration: 30,
        },
        {
          doctorId: doctor.id,
          dayOfWeek: DayOfWeek.TUESDAY,
          startTime: "09:00",
          endTime: "13:00",
          slotDuration: 30,
        },
        {
          doctorId: doctor.id,
          dayOfWeek: DayOfWeek.WEDNESDAY,
          startTime: "09:00",
          endTime: "13:00",
          slotDuration: 30,
        },
        {
          doctorId: doctor.id,
          dayOfWeek: DayOfWeek.THURSDAY,
          startTime: "14:00",
          endTime: "18:00",
          slotDuration: 30,
        },
        {
          doctorId: doctor.id,
          dayOfWeek: DayOfWeek.FRIDAY,
          startTime: "14:00",
          endTime: "18:00",
          slotDuration: 30,
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log("✅ Doctor availability created");

  // --------------------------------------------------
  // PATIENT
  // --------------------------------------------------

  const patientUser = await prisma.user.upsert({
    where: {
      email: "patient@healdoor.com",
    },
    update: {},
    create: {
      name: "Vinay Patient",
      email: "patient@healdoor.com",
      passwordHash,
      role: UserRole.PATIENT,
      phone: "9876543210",
      emailVerified: true,
    },
  });

  await prisma.patient.upsert({
    where: {
      userId: patientUser.id,
    },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date("2000-01-15"),
      gender: Gender.MALE,
      address: "Mangaluru, Karnataka",
      emergencyContact: "9876543211",
    },
  });

  console.log(`✅ Patient created: ${patientUser.email}`);

  console.log("");
  console.log("🎉 Database seeding completed successfully!");
  console.log("");
  console.log("Development login credentials:");
  console.log("--------------------------------");
  console.log("Admin:");
  console.log("  admin@healdoor.com");
  console.log("  Password@123");
  console.log("");
  console.log("Doctors:");
  console.log("  rahul@healdoor.com");
  console.log("  priya@healdoor.com");
  console.log("  ananya@healdoor.com");
  console.log("  arjun@healdoor.com");
  console.log("  sneha@healdoor.com");
  console.log("  Password@123");
  console.log("");
  console.log("Patient:");
  console.log("  patient@healdoor.com");
  console.log("  Password@123");
  console.log("--------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });