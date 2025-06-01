import React from "react";

export default function useVM<T>(vmContext: React.Context<T | null>) {
  const vm = React.useContext(vmContext);
  if (!vm) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error("useVM must be used within a VMProvider.");
  }
  return vm;
}
