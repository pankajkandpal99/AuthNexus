import { Search } from "lucide-react";
import { ComponentProps, forwardRef, useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";

export interface SearchProps extends ComponentProps<"input"> {
  onSearchChange: (value: string) => void;
  debounceTime?: number;
  iconClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className,
      iconClassName,
      inputClassName,
      containerClassName,
      onSearchChange,
      debounceTime = 300,
      ...props
    },
    ref
  ) => {
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, debounceTime);

    useEffect(() => {
      onSearchChange(debouncedSearchValue);
    }, [debouncedSearchValue, onSearchChange]);

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
            iconClassName
          )}
        />
        <Input
          ref={ref}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn(
            "pl-10 pr-4 h-9 bg-background/80 border-input focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0",
            inputClassName,
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
