import "server-only";

import { getDatabase } from "@/lib/server/db";

export type VendorContact = {
  id: string;
  label: string;
  phoneNumber: string;
};

const initialVendorContacts = [
  { label: "Primary vendor", phoneNumber: "+237679125986" },
  { label: "Alternate vendor", phoneNumber: "+237672616599" },
];

export async function initializeVendorContactsTable() {
  const database = getDatabase();
  await database`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await database`
    CREATE TABLE IF NOT EXISTS vendor_contacts (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      label VARCHAR(80) NOT NULL,
      phone_number VARCHAR(20) NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function seedInitialVendorContacts() {
  await initializeVendorContactsTable();
  const database = getDatabase();

  for (const contact of initialVendorContacts) {
    await database`
      INSERT INTO vendor_contacts (label, phone_number)
      VALUES (${contact.label}, ${contact.phoneNumber})
      ON CONFLICT (phone_number) DO NOTHING
    `;
  }
}

export async function getVendorContacts(): Promise<VendorContact[]> {
  const database = getDatabase();
  const rows = await database<VendorContact[]>`
    SELECT id, label, phone_number AS "phoneNumber"
    FROM vendor_contacts
    WHERE is_active = TRUE
    ORDER BY created_at, label
  `;

  return rows;
}

export async function addVendorContact(label: string, phoneNumber: string) {
  const database = getDatabase();
  const [contact] = await database<VendorContact[]>`
    INSERT INTO vendor_contacts (label, phone_number)
    VALUES (${label}, ${phoneNumber})
    RETURNING id, label, phone_number AS "phoneNumber"
  `;

  return contact;
}
