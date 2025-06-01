export function exists<T>(item: T | false | null | undefined): item is T {
  return !!item;
}
