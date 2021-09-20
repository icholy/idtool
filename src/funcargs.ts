
/**
 * Find a function's parameter names.
 * 
 * @param func the function to analyse
 * @returns array of parameter names
 */
export function funcArgs(func: Function): string[] {
    if (func.length === 0) {
        return [];
    }
    const string = func.toString();
    // First match everything inside the function argument parens. like `function (arg1,arg2) {}` or `async function(arg1,arg2) {}
    const args = (
        string.match(/(?:async|function)\s*.*?\(([^)]*)\)/)?.[1] ||
        // arrow functions with multiple arguments  like `(arg1,arg2) => {}`
        string.match(/^\s*\(([^)]*)\)\s*=>/)?.[1] ||
        // arrow functions with single argument without parens like `arg => {}`
        string.match(/^\s*([^=]*)=>/)?.[1]
    )
    if (!args) {
        throw new Error("failed to parse method arguments");
    }
    // Split the arguments string into an array comma delimited.
    return args.split(',').map(arg => {
        // Ensure no inline comments are parsed and trim the whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();
    }).filter(function(arg) {
        // Ensure no undefined values are added.
        return arg;
    });
}