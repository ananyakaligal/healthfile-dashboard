// Seed patient metadata into Nextcloud as patient-info.json per folder
// Requires Nextcloud running via docker-compose and accessible at http://localhost:8080

const NEXTCLOUD_URL = "http://localhost:8080/remote.php/dav/files/admin/";
const USERNAME = "admin";
const APP_PASSWORD = "PdYXt-3di5x-Dazkb-iJJrt-DewBd";

const patients = {
  "David Johnson": {
    email: "david.johnson@example.com",
    phone: "07700900345",
    dob: "1975-03-12",
    gender: "Male",
    bloodType: "O+",
    address: "10 Downing Street, London, SW1A 2AA",
    allergies: "Penicillin",
    medicalHistory: "Seasonal Asthma",
  },
  "Ananya Gupta": {
    email: "ananya.gupta@example.com",
    phone: "09876543210",
    dob: "1990-08-25",
    gender: "Female",
    bloodType: "B+",
    address: "Flat 401, Sapphire Towers, MG Road, Mumbai",
    allergies: "Dust",
    medicalHistory: "Mild Migraines",
  },
  "Emily White": {
    email: "emily.white@example.com",
    phone: "07890123456",
    dob: "1982-01-01",
    gender: "Female",
    bloodType: "A-",
    address: "The Old Rectory, Village Green, Ruralshire",
    allergies: "Shellfish",
    medicalHistory: "Gluten Intolerance",
  },
  "Rohan Mehta": {
    email: "rohan.mehta@example.com",
    phone: "09123456789",
    dob: "1968-04-17",
    gender: "Male",
    bloodType: "AB-",
    address: "House No. 22, Green Avenue, Chennai",
    allergies: "NKA (No Known Allergies)",
    medicalHistory: "Controlled Hypertension",
  },
  "Sarah Davies": {
    email: "sarah.davies@example.com",
    phone: "07950517270",
    dob: "1995-11-29",
    gender: "Female",
    bloodType: "O-",
    address: "Apartment 5, City Centre, Manchester",
    allergies: "Bee Stings",
    medicalHistory: "Recurrent Ear Infections",
  },
};

async function ensureFolder(name) {
  const url = `${NEXTCLOUD_URL}${encodeURIComponent(name)}/`;
  const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString("base64");
  const res = await fetch(url, {
    method: "MKCOL",
    headers: { Authorization: `Basic ${auth}` },
  });
  if (res.ok || res.status === 405) return; // exists
  const text = await res.text();
  throw new Error(`MKCOL ${name} failed: ${res.status} ${text}`);
}

async function putMetadata(name, data) {
  const url = `${NEXTCLOUD_URL}${encodeURIComponent(name)}/patient-info.json`;
  const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString("base64");
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fullName: name, ...data }, null, 2),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${name}/patient-info.json failed: ${res.status} ${text}`);
  }
}

(async () => {
  console.log("Seeding patient metadata to Nextcloud...\n");
  for (const [name, meta] of Object.entries(patients)) {
    try {
      await ensureFolder(name);
      await putMetadata(name, meta);
      console.log(`✓ Wrote metadata for: ${name}`);
    } catch (e) {
      console.error(`✗ Failed for ${name}:`, e.message);
    }
  }
  console.log("\nDone. Check each folder for patient-info.json in Nextcloud.");
})();
