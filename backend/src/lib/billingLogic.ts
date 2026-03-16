export class BillingLogic {
  /**
   * Calculates the parking bill amount.
   * - Compulsory entry fee: 30 rupees (charged once when vehicle enters).
   * - Additional charge: 3 rupees per minute (or part thereof).
   * 
   * @param entryTime - Date when the vehicle entered (must be a valid Date object).
   * @param exitTime - Date when the vehicle exited (must be after entryTime).
   * @returns Total amount in rupees (number).
   * @throws Error if exitTime is not after entryTime.
   */
  public calculateAmount(entryTime: Date, exitTime: Date): number {
    // Validate inputs
    if (!(entryTime instanceof Date) || !(exitTime instanceof Date)) {
      throw new Error("Entry time and exit time must be valid Date objects.");
    }

    if (exitTime.getTime() <= entryTime.getTime()) {
      throw new Error("Exit time must be strictly after entry time.");
    }

    // Calculate time difference in milliseconds
    const timeDiffMs = exitTime.getTime() - entryTime.getTime();

    // Convert to minutes (ceil so any started minute is charged)
    const minutesParked = Math.ceil(timeDiffMs / (1000 * 60));

    // Billing logic
    const compulsoryFee = 30;     // Fixed entry fee
    const perMinuteRate = 3;      // 3 rupees per minute

    const totalAmount = compulsoryFee + (minutesParked * perMinuteRate);

    return totalAmount;
  }
}
export default new BillingLogic();