import { useState } from "react";

// export function invalidHookUsage() {
//   const [value, setValue] = useState(0);

//   return {
//     value,
//     setValue,
//   };
// }

export function useValidHookUsage() {
  const [value, setValue] = useState(0);

  return {
    value,
    setValue,
  };
}
