// Custom field definition
export interface CustomField {
  name: string;
  enabled: boolean;
}

// Custom field values for items
export interface CustomFieldValues {
  [key: string]: string | number | boolean | null;
}

// Inventory with custom fields
export interface InventoryWithCustomFields {
  id: string;
  name: string;
  description: string | null;
  topic: string;
  integerFields?: CustomField[];
  stringFields?: CustomField[];
  textFields?: CustomField[];
  booleanFields?: CustomField[];
  dateFields?: CustomField[];
  creatorId: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
