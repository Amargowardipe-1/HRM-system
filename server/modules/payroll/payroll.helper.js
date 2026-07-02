

const calculateGrossSalary = ({
  basicSalary,
  allowance = 0,
  bonus = 0,
  overtimeAmount = 0,
}) => {
  return Number(
    (
      basicSalary +
      allowance +
      bonus +
      overtimeAmount
    ).toFixed(2)
  );
};


const calculateNetSalary = ({
  grossSalary,
  deduction = 0,
  tax = 0,
  pf = 0,
  esic = 0,
}) => {
  return Number(
    (
      grossSalary -
      deduction -
      tax -
      pf -
      esic
    ).toFixed(2)
  );
};


// Calculate Provident Fund (PF)
// Default: 12% of Basic Salary


const calculatePF = (
  basicSalary,
  percentage = 12
) => {
  return Number(
    (
      (basicSalary * percentage) /
      100
    ).toFixed(2)
  );
};

// Calculate ESIC
// Default: 0.75% of Gross Salary


const calculateESIC = (
  grossSalary,
  percentage = 0.75
) => {
  return Number(
    (
      (grossSalary * percentage) /
      100
    ).toFixed(2)
  );
};

// Calculate Income Tax
// Flat Percentage (Future: Slab Based)


const calculateTax = (
  grossSalary,
  percentage = 10
) => {
  return Number(
    (
      (grossSalary * percentage) /
      100
    ).toFixed(2)
  );
};

// Calculate Overtime Amount

const calculateOvertimeAmount = ({
  overtimeHours = 0,
  hourlyRate = 0,
}) => {
  return Number(
    (
      overtimeHours *
      hourlyRate
    ).toFixed(2)
  );
};


module.exports = {
  calculateGrossSalary,
  calculateNetSalary,
  calculatePF,
  calculateESIC,
  calculateTax,
  calculateOvertimeAmount,
};