import { HOME_SECTIONS } from "../../types/admin-home-section-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SectionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const SectionSelector = ({ value, onChange }: SectionSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[230px]">
        <SelectValue placeholder="Select section" />
      </SelectTrigger>
      <SelectContent>
        {HOME_SECTIONS.map((section) => (
          <SelectItem key={section.id} value={section.id}>
            {section.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
