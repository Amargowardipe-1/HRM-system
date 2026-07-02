const User = require("../modules/user/user.model");
const Department = require("../modules/department/department.model");
const Designation = require("../modules/designation/designation.model");
const { hashPassword } = require("./auth.helper");

/**
 * Seed initial departments if not present.
 */
const seedDepartments = async () => {
  try {
    const defaultDepts = [
      { name: "Engineering", description: "Product development, technology, and engineering operations.", allocatedBudget: 250000, costCenterCode: "ENG-HQ" },
      { name: "Human Resources", description: "Talent acquisition, employee welfare, and people operations.", allocatedBudget: 80000, costCenterCode: "HR-HQ" },
      { name: "Sales", description: "Customer relationships, revenue generation, and client partnerships.", allocatedBudget: 150000, costCenterCode: "SAL-HQ" },
      { name: "Marketing", description: "Brand awareness, promotions, social media, and advertising.", allocatedBudget: 100000, costCenterCode: "MKT-HQ" },
      { name: "IT", description: "Information Technology and systems support.", allocatedBudget: 200000, costCenterCode: "IT-HQ" },
      { name: "Finance", description: "Financial planning, accounting, and payroll.", allocatedBudget: 120000, costCenterCode: "FIN-HQ" },
    ];

    const seededDepts = [];

    for (const dept of defaultDepts) {
      let existing = await Department.findOne({ name: dept.name });
      if (!existing) {
        existing = await Department.create(dept);
        console.log(`Seeded Department: ${dept.name}`);
      } else {
        // Update budget and cost center on existing
        existing.allocatedBudget = dept.allocatedBudget;
        existing.costCenterCode = dept.costCenterCode;
        await existing.save();
      }
      seededDepts.push(existing);
    }

    // Seed hierarchical department
    const engDept = seededDepts.find((d) => d.name === "Engineering");
    if (engDept) {
      let subDept = await Department.findOne({ name: "Mobile Platforms" });
      if (!subDept) {
        subDept = await Department.create({
          name: "Mobile Platforms",
          description: "iOS and Android client application development.",
          parentDepartment: engDept._id,
          allocatedBudget: 60000,
          costCenterCode: "ENG-MOB",
        });
        console.log(`Seeded Sub-Department: Mobile Platforms under Engineering`);
      }
      seededDepts.push(subDept);
    }

    return seededDepts;
  } catch (error) {
    console.error("Error seeding departments:", error.message);
    return [];
  }
};

/**
 * Seed initial designations if not present.
 */
const seedDesignations = async (departments) => {
  try {
    const itDept = departments.find((d) => d.name === "IT");
    const engDept = departments.find((d) => d.name === "Engineering");
    const hrDept = departments.find((d) => d.name === "Human Resources");
    const finDept = departments.find((d) => d.name === "Finance");

    const defaultDesignations = [];

    if (itDept) {
      defaultDesignations.push(
        { title: "Software Engineer", department: itDept._id, level: "Junior", description: "Builds and maintains client applications." },
        { title: "Senior Software Engineer", department: itDept._id, level: "Senior", description: "Designs architectures and mentors junior devs." },
        { title: "Team Lead", department: itDept._id, level: "Lead", description: "Leads a team of software engineers." }
      );
    }

    if (engDept) {
      defaultDesignations.push(
        { title: "QA Engineer", department: engDept._id, level: "Junior", description: "Performs manual and automated testing." },
        { title: "Engineering Manager", department: engDept._id, level: "Manager", description: "Manages engineering teams and delivery." }
      );
    }

    if (hrDept) {
      defaultDesignations.push(
        { title: "HR Executive", department: hrDept._id, level: "Junior", description: "Manages hiring and onboarding operations." },
        { title: "HR Manager", department: hrDept._id, level: "Manager", description: "Oversees people operations and employee relations." }
      );
    }

    if (finDept) {
      defaultDesignations.push(
        { title: "Accountant", department: finDept._id, level: "Junior", description: "Handles daily bookkeeping and invoicing." }
      );
    }

    const seededDesignations = [];

    for (const desig of defaultDesignations) {
      let existing = await Designation.findOne({ title: desig.title, department: desig.department });
      if (!existing) {
        existing = await Designation.create(desig);
        console.log(`Seeded Designation: ${desig.title}`);
      }
      seededDesignations.push(existing);
    }

    return seededDesignations;
  } catch (error) {
    console.error("Error seeding designations:", error.message);
    return [];
  }
};

/**
 * Seed default Admin user, departments, and designations.
 */
const seedAdmin = async () => {
  try {
    // Seed departments first
    const seededDepts = await seedDepartments();
    const engDept = seededDepts.find((d) => d.name === "Engineering");
    
    // Seed designations next
    const seededDesignations = await seedDesignations(seededDepts);
    const leadDesignation = seededDesignations.find((d) => d.title === "Team Lead");

    let adminUser = await User.findOne({ email: "admin@hrm.com" });
    if (!adminUser) {
      console.log("Default Admin user not found. Seeding default Admin user credentials...");
      const hashedPassword = await hashPassword("admin123");
      adminUser = await User.create({
        email: "admin@hrm.com",
        password: hashedPassword,
        role: "Admin",
        isActive: true,
      });
      console.log("Default Admin credentials seeded successfully.");
    } else {
      console.log("Default Admin user credentials already exist.");
    }

    // Check if Employee profile exists for the Admin
    const Employee = require("../modules/employee/employee.model");
    let adminEmployee = await Employee.findOne({ userId: adminUser._id });
    if (!adminEmployee) {
      console.log("Default Admin Employee profile not found. Seeding...");
      adminEmployee = await Employee.create({
        userId: adminUser._id,
        employeeCode: "EMP000",
        firstName: "Admin",
        lastName: "User",
        phone: "1234567890",
        gender: "Male",
        department: engDept ? engDept._id : null,
        designation: leadDesignation ? leadDesignation._id : null,
        salary: 120000,
        status: "Active",
      });
      console.log("Default Admin Employee profile seeded successfully.");
    } else {
      console.log("Default Admin Employee profile already exists.");
      
      // Sync properties if needed
      let modified = false;
      if (!adminEmployee.department && engDept) {
        adminEmployee.department = engDept._id;
        modified = true;
      }
      if (!adminEmployee.designation && leadDesignation) {
        adminEmployee.designation = leadDesignation._id;
        modified = true;
      }
      if (adminEmployee.salary !== 120000) {
        adminEmployee.salary = 120000;
        modified = true;
      }
      if (modified) {
        await adminEmployee.save();
        console.log("Default Admin Employee profile synced.");
      }
    }
  } catch (error) {
    console.error("Error seeding default admin, departments & designations:", error.message);
  }
};

module.exports = {
  seedAdmin,
};
