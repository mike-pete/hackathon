import { create } from "zustand";
import { persist } from "zustand/middleware";

// A rule is a key/value pair:
//   key   = what you're evaluating
//   value = what makes it a good fit
export type Rule = {
  id: string;
  key: string;
  value: string;
};

type RulesState = {
  rules: Rule[];
  addRule: () => void;
  updateRule: (id: string, patch: Partial<Pick<Rule, "key" | "value">>) => void;
  removeRule: (id: string) => void;
};

export const useRulesStore = create<RulesState>()(
  persist(
    (set) => ({
      rules: [],
      addRule: () =>
        set((state) => ({
          rules: [
            ...state.rules,
            { id: crypto.randomUUID(), key: "", value: "" },
          ],
        })),
      updateRule: (id, patch) =>
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, ...patch } : rule,
          ),
        })),
      removeRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== id),
        })),
    }),
    { name: "hirehand-rules" },
  ),
);
