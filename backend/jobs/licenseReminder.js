const cron = require('node-cron');
const pool = require('../db');
const { sendEmail } = require('../utils/emailService');

/**
 * Checks for expiring driver licenses and sends an alert email.
 * Target thresholds: 30 days, 7 days, and expired (0 or negative days).
 */
const checkExpiringLicenses = async () => {
  console.log('Running scheduled job: License Expiry Check...');
  
  try {
    const query = `
      SELECT id, name, license_no, license_category, license_expiry,
             (license_expiry - CURRENT_DATE) as days_until_expiry
      FROM drivers
      WHERE status != 'Suspended' 
        AND status != 'Off Duty'
        AND (
          (license_expiry - CURRENT_DATE) = 30 OR
          (license_expiry - CURRENT_DATE) = 7 OR
          (license_expiry - CURRENT_DATE) <= 0
        )
      ORDER BY days_until_expiry ASC;
    `;
    
    const result = await pool.query(query);
    const expiringDrivers = result.rows;

    if (expiringDrivers.length === 0) {
      console.log('No expiring licenses found for today\'s alert thresholds.');
      return;
    }

    // Format the email content
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f87171; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Driver License Expiry Alert</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p style="color: #334155; font-size: 16px;">The following drivers have licenses that are expiring soon or have already expired. Please take immediate action to ensure compliance.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569;">Driver Name</th>
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569;">License No</th>
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569;">Expiry Date</th>
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569;">Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    expiringDrivers.forEach(driver => {
      const days = parseInt(driver.days_until_expiry);
      let statusHtml = '';
      
      if (days <= 0) {
        statusHtml = `<span style="color: #dc2626; font-weight: bold;">Expired (${Math.abs(days)} days ago)</span>`;
      } else if (days === 7) {
        statusHtml = `<span style="color: #ea580c; font-weight: bold;">Expires in 7 days</span>`;
      } else {
        statusHtml = `<span style="color: #ca8a04; font-weight: bold;">Expires in 30 days</span>`;
      }

      // Format date
      const expiryDate = new Date(driver.license_expiry).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      htmlContent += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${driver.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${driver.license_no}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${expiryDate}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${statusHtml}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            This is an automated message from the TransitOps system.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      subject: `⚠️ License Expiry Alert: ${expiringDrivers.length} Driver(s) Require Attention`,
      html: htmlContent
    });

    console.log(`Sent license expiry alert for ${expiringDrivers.length} drivers.`);

    // Note: We might want to auto-suspend drivers with expired licenses here
    const expiredDriverIds = expiringDrivers.filter(d => parseInt(d.days_until_expiry) <= 0).map(d => d.id);
    if (expiredDriverIds.length > 0) {
      const suspendQuery = `UPDATE drivers SET status = 'Suspended' WHERE id = ANY($1)`;
      await pool.query(suspendQuery, [expiredDriverIds]);
      console.log(`Auto-suspended ${expiredDriverIds.length} drivers with expired licenses.`);
    }

  } catch (error) {
    console.error('Failed to run license reminder job:', error);
  }
};

/**
 * Initializes the cron job.
 * Runs every day at 08:00 AM server time.
 */
const initLicenseReminderJob = () => {
  console.log('Initializing License Reminder Cron Job (Runs daily at 08:00 AM)...');
  
  // Schedule to run at 08:00 every day
  cron.schedule('0 8 * * *', () => {
    checkExpiringLicenses();
  });
};

module.exports = {
  initLicenseReminderJob,
  checkExpiringLicenses // exported for manual testing
};
