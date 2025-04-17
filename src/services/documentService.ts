import { Document, MonthGroup } from "@/types/document";

// Function to group documents by month
export const groupDocumentsByMonth = (documents: Document[]) => {
  const monthGroups: { [key: string]: Document[] } = {};
  
  // Sort documents by procedure_date in descending order
  const sortedDocuments = [...documents].sort((a, b) => {
    if (!a.procedure_date) return 1;
    if (!b.procedure_date) return -1;
    return new Date(b.procedure_date).getTime() - new Date(a.procedure_date).getTime();
  });

  sortedDocuments.forEach((document) => {
    let monthKey = "Invalid Date";
    
    if (document.procedure_date) {
      const date = new Date(document.procedure_date);
      if (!isNaN(date.getTime())) {
        monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
    }
    
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = [];
    }
    monthGroups[monthKey].push(document);
  });

  // Convert the groups object to an array and sort by date
  return Object.entries(monthGroups)
    .map(([month, docs]) => ({
      month,
      documents: docs
    }))
    .sort((a, b) => {
      if (a.month === "Invalid Date") return 1;
      if (b.month === "Invalid Date") return -1;
      
      const [aMonth, aYear] = a.month.split(" ");
      const [bMonth, bYear] = b.month.split(" ");
      
      if (aYear !== bYear) {
        return parseInt(bYear) - parseInt(aYear);
      }
      
      const months = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
      return months.indexOf(bMonth) - months.indexOf(aMonth);
    });
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchDocuments(token: string): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/gallery`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

export async function searchDocuments(query: string, token: string): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/documents/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to search documents');
  }

  return response.json();
}

export async function deleteDocument(documentName: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(documentName)}`, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
}

export async function getDocument(documentName: string, token: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(documentName)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }

  return response.json();
}
