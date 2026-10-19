import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching Edge headless browser...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // 2x Retina DPI for razor-sharp figures
  });

  const page = await context.newPage();
  const baseUrl = 'https://ruthish-s.github.io/ergosnap';

  // Step 1: Upload page initial
  console.log('1. Navigating to Upload page...');
  await page.goto(`${baseUrl}/#/upload`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_upload_interface.png'), fullPage: false });
  console.log('✓ Captured 01_upload_interface.png');

  // Step 2: Load demo benchmark posture
  console.log('2. Loading benchmark sample posture...');
  await page.click('button:has-text("Load Demo Benchmark Posture")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_upload_with_posture.png'), fullPage: false });
  console.log('✓ Captured 02_upload_with_posture.png');

  // Step 3: Run Pose Landmark Detection & Navigate to Analysis Workbench
  console.log('3. Running Pose Landmark Detection...');
  await page.click('button:has-text("Run Pose Landmark Detection")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_pose_landmark_workbench.png'), fullPage: false });
  console.log('✓ Captured 03_pose_landmark_workbench.png');

  // Step 4: Compile RULA & Open Dashboard
  console.log('4. Compiling RULA Assessment & Opening Dashboard...');
  await page.click('button:has-text("Compile RULA Assessment & Open Dashboard")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dashboard_overview.png'), fullPage: false });
  console.log('✓ Captured 04_dashboard_overview.png');

  // Step 5: Dashboard - Image Analysis Tab
  console.log('5. Capturing Image Analysis Tab...');
  await page.click('button:has-text("Image Analysis")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_dashboard_image_analysis.png'), fullPage: false });
  console.log('✓ Captured 05_dashboard_image_analysis.png');

  // Step 6: Dashboard - Angles & Neutral Zones Tab
  console.log('6. Capturing Angles & Neutral Zones Tab...');
  await page.click('button:has-text("Angles & Zones")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_dashboard_angles_neutral_zones.png'), fullPage: false });
  console.log('✓ Captured 06_dashboard_angles_neutral_zones.png');

  // Step 7: Dashboard - RULA & Sensitivity Tab
  console.log('7. Capturing RULA & Sensitivity Tab...');
  await page.click('button:has-text("RULA & Sensitivity")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_dashboard_rula_sensitivity.png'), fullPage: false });
  console.log('✓ Captured 07_dashboard_rula_sensitivity.png');

  // Step 8: Dashboard - WMSD Body Map Tab
  console.log('8. Capturing WMSD Body Map Tab...');
  await page.click('button:has-text("WMSD Body Map")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_dashboard_wmsd_heatmap.png'), fullPage: false });
  console.log('✓ Captured 08_dashboard_wmsd_heatmap.png');

  // Step 9: Dashboard - Workstation Fit Tab
  console.log('9. Capturing Workstation Fit Tab...');
  await page.click('button:has-text("Workstation Fit")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_dashboard_workstation_fit.png'), fullPage: false });
  console.log('✓ Captured 09_dashboard_workstation_fit.png');

  // Step 10: Dashboard - Corrective Actions Tab
  console.log('10. Capturing Corrective Actions Tab...');
  await page.click('button:has-text("Corrective Actions")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_dashboard_corrective_action_matrix.png'), fullPage: false });
  console.log('✓ Captured 10_dashboard_corrective_action_matrix.png');

  // Step 11: Validation Engine Page
  console.log('11. Navigating to Empirical Validation Engine...');
  await page.goto(`${baseUrl}/#/validation`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_validation_engine.png'), fullPage: false });
  console.log('✓ Captured 11_validation_engine.png');

  // Step 12: Technical PDF Report Publication Preview Page
  console.log('12. Navigating to Technical Report Preview...');
  await page.goto(`${baseUrl}/#/report`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_technical_report_preview.png'), fullPage: false });
  console.log('✓ Captured 12_technical_report_preview.png');

  await browser.close();
  console.log('✨ All 12 High-DPI screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
