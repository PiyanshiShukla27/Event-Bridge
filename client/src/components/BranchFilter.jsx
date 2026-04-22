import { Tag } from 'lucide-react';

const BRANCHES = ['All', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'BioTech'];

const BranchFilter = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {BRANCHES.map((branch) => (
        <button
          key={branch}
          onClick={() => onSelect(branch)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
            selected === branch
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          {branch === 'All' ? 'All Departments' : branch}
        </button>
      ))}
    </div>
  );
};

export default BranchFilter;
