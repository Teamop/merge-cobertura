# Merge Cobertura

![NPM Version](https://img.shields.io/npm/v/merge-cobertura)


Utility to merge multiple cobertura xml files into one.

## Background
Got inspired by [cobertura-merge](https://github.com/borremosch/cobertura-merge), intention on replacing the node-gyp usage.

## Usage

It can be installed through `npm` and used locally:

```
npm install merge-cobertura
merge-cobertura -o output.xml package1=input1.xml package2=input2.xml
```

Or it can be used directly without installing through `npx`:

```
npx merge-cobertura -o output.xml package1=input1.xml package2=input2.xml
```

## Options

| option      | description                                                  |
| ----------- | ------------------------------------------------------------ |
| -o FILE     | Outputs the generated xml to the specified file              |
| -p, --print | Prints a summary of the code coverage to the standard output |
