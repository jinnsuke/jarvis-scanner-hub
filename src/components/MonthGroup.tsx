
import { MonthGroup as MonthGroupType } from "@/types/document";
import DocumentCard from "./DocumentCard";

interface MonthGroupProps {
  group: MonthGroupType;
  onRename: (id: string, newName: string) => void;
}

const MonthGroup = ({ group, onRename }: MonthGroupProps) => {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-bsc-darktext">{group.month}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {group.documents.map((document) => (
          <DocumentCard 
            key={document.id} 
            document={document} 
            onRename={onRename} 
          />
        ))}
      </div>
    </div>
  );
};

export default MonthGroup;
