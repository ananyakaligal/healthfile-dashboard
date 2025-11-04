// Script to add patient folders to Nextcloud
const patients = [
  "David Johnson",
  "Ananya Gupta",
  "Emily White",
  "Rohan Mehta",
  "Sarah Davies"
];

const NEXTCLOUD_URL = "http://localhost:8080/remote.php/dav/files/admin/";
const USERNAME = "admin";
const APP_PASSWORD = "PdYXt-3di5x-Dazkb-iJJrt-DewBd";

async function createFolder(folderName) {
  const url = `${NEXTCLOUD_URL}${encodeURIComponent(folderName)}/`;
  const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64');
  
  try {
    const response = await fetch(url, {
      method: 'MKCOL',
      headers: {
        'Authorization': `Basic ${auth}`,
      }
    });

    if (response.ok || response.status === 405) {
      console.log(`✓ Created folder: ${folderName}`);
      return true;
    } else {
      console.log(`✗ Failed to create ${folderName}: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error creating ${folderName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("Creating patient folders in Nextcloud...\n");
  
  for (const patient of patients) {
    await createFolder(patient);
  }
  
  console.log("\nDone! Refresh your dashboard to see the new patients.");
}

main();
