import { describe, it } from 'test';
import assert from 'assert';
import { mergeInputs } from '../src/merge';
import {
  EMPTY_INPUT_FILE,
  INPUT_FILE1,
  INPUT_FILE2,
  INPUT_FILE_WITH_ROOT_CLASSES,
  EMPTY_INPUT_FILE_WITHOUT_CLASSES
} from './data';
import { Package, Class } from '../src/types/cobertura';
const path = require('path');

describe('mergeInputs', () => {
  it('should merge a single empty file', () => {
    const output = mergeInputs([EMPTY_INPUT_FILE]);

    assert.ok(output.coverage);
    assert.strictEqual(output.coverage['line-rate'], EMPTY_INPUT_FILE.data.coverage['line-rate']);
    assert.strictEqual(output.coverage['branch-rate'], EMPTY_INPUT_FILE.data.coverage['branch-rate']);
    assert.strictEqual(output.coverage['lines-covered'], EMPTY_INPUT_FILE.data.coverage['lines-covered']);
    assert.strictEqual(output.coverage['lines-valid'], EMPTY_INPUT_FILE.data.coverage['lines-valid']);
    assert.strictEqual(output.coverage['branches-covered'], EMPTY_INPUT_FILE.data.coverage['branches-covered']);
    assert.strictEqual(output.coverage['branches-valid'], EMPTY_INPUT_FILE.data.coverage['branches-valid']);
    assert.strictEqual(output.coverage.complexity, EMPTY_INPUT_FILE.data.coverage.complexity);
    assert.ok(Math.abs(parseInt(output.coverage.timestamp, 10) - Date.now()) <= 100, 'timestamp should be within 100ms of now');
    assert.ok(Array.isArray(output.coverage.sources));
    assert.strictEqual(output.coverage.sources!.length, 1);
    assert.strictEqual(output.coverage.sources![0].source.length, 1);
    assert.strictEqual(output.coverage.sources![0].source[0].$t, process.cwd());
    assert.ok(Array.isArray(output.coverage.packages));
    assert.strictEqual(output.coverage.packages.length, 1);
    assert.ok(Array.isArray((output.coverage.packages as Package[])[0].package));
    assert.strictEqual((output.coverage.packages as Package[])[0].package.length, 0);
  });

  it('should merge two files into a single file', () => {
    const output = mergeInputs([INPUT_FILE1, INPUT_FILE2]);

    const totalLinesCovered =
      parseInt(INPUT_FILE1.data.coverage['lines-covered'], 10) +
      parseInt(INPUT_FILE2.data.coverage['lines-covered'], 10);
    const totalLinesValid =
      parseInt(INPUT_FILE1.data.coverage['lines-valid'], 10) +
      parseInt(INPUT_FILE2.data.coverage['lines-valid'], 10);
    const totalBranchesCovered =
      parseInt(INPUT_FILE1.data.coverage['branches-covered'], 10) +
      parseInt(INPUT_FILE2.data.coverage['branches-covered'], 10);
    const totalBranchesValid =
      parseInt(INPUT_FILE1.data.coverage['branches-valid'], 10) +
      parseInt(INPUT_FILE2.data.coverage['branches-valid'], 10);

    const complexity = Math.max(
      parseInt(INPUT_FILE1.data.coverage.complexity, 10),
      parseInt(INPUT_FILE2.data.coverage.complexity, 10)
    );

    assert.ok(output.coverage);
    assert.strictEqual(output.coverage['line-rate'], (totalLinesCovered / totalLinesValid).toString());
    assert.strictEqual(output.coverage['branch-rate'], (totalBranchesCovered / totalBranchesValid).toString());
    assert.strictEqual(output.coverage['lines-covered'], totalLinesCovered.toString());
    assert.strictEqual(output.coverage['lines-valid'], totalLinesValid.toString());
    assert.strictEqual(output.coverage['branches-covered'], totalBranchesCovered.toString());
    assert.strictEqual(output.coverage['branches-valid'], totalBranchesValid.toString());
    assert.strictEqual(output.coverage.complexity, complexity.toString());
    assert.ok(Math.abs(parseInt(output.coverage.timestamp, 10) - Date.now()) <= 100, 'timestamp should be within 100ms of now');
    assert.ok(Array.isArray(output.coverage.sources));
    assert.strictEqual(output.coverage.sources!.length, 1);
    assert.strictEqual(output.coverage.sources![0].source.length, 1);
    assert.strictEqual(output.coverage.sources![0].source[0].$t, process.cwd());
    assert.ok(Array.isArray(output.coverage.packages));
    assert.strictEqual(output.coverage.packages.length, 1);
    assert.ok(Array.isArray((output.coverage.packages[0] as Package).package));
    assert.strictEqual((output.coverage.packages[0] as Package).package.length, 2);

    // Validate first output package
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0].name,
      `${INPUT_FILE1.packageName}.${(INPUT_FILE1.data.coverage.packages[0] as Package).package[0].name}`
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0]['line-rate'],
      (INPUT_FILE1.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0]['branch-rate'],
      (INPUT_FILE1.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0].complexity,
      (INPUT_FILE1.data.coverage.packages[0] as Package).package[0].complexity
    );

    assert.notStrictEqual((INPUT_FILE1.data.coverage.packages[0] as Package).package[0].classes, null);

    assert.deepStrictEqual(
      (output.coverage.packages[0] as Package).package[0].classes,
      ((INPUT_FILE1.data.coverage.packages[0] as Package).package[0].classes as Class[]).map(
        (inputClasses: Class) => ({
          class: inputClasses.class.map(inputClass => ({
            ...inputClass,
            filename: path.normalize(INPUT_FILE1.data.coverage.sources![0].source[0].$t + '/' + inputClass.filename)
          }))
        })
      )
    );

    // Validate second output package
    assert.strictEqual((output.coverage.packages[0] as Package).package[1].name, INPUT_FILE2.packageName);
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1]['line-rate'],
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1]['branch-rate'],
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1].complexity,
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0].complexity
    );
    assert.notStrictEqual((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes, null);
    assert.deepStrictEqual(
      (output.coverage.packages[0] as Package).package[1].classes,
      ((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes as Class[]).map(
        (inputClasses: Class) => ({
          class: inputClasses.class.map(inputClass => ({
            ...inputClass,
            filename: path.normalize(INPUT_FILE2.data.coverage.sources![0].source[0].$t + '/' + inputClass.filename)
          }))
        })
      )
    );
  });

  it('should merge two files, one of which has no packages but classes at the root, into a single file', () => {
    const output = mergeInputs([INPUT_FILE2, INPUT_FILE_WITH_ROOT_CLASSES]);

    const totalLinesCovered =
      parseInt(INPUT_FILE2.data.coverage['lines-covered'], 10) +
      parseInt(INPUT_FILE_WITH_ROOT_CLASSES.data.coverage['lines-covered'], 10);
    const totalLinesValid =
      parseInt(INPUT_FILE2.data.coverage['lines-valid'], 10) +
      parseInt(INPUT_FILE_WITH_ROOT_CLASSES.data.coverage['lines-valid'], 10);
    const totalBranchesCovered =
      parseInt(INPUT_FILE2.data.coverage['branches-covered'], 10) +
      parseInt(INPUT_FILE_WITH_ROOT_CLASSES.data.coverage['branches-covered'], 10);
    const totalBranchesValid =
      parseInt(INPUT_FILE2.data.coverage['branches-valid'], 10) +
      parseInt(INPUT_FILE_WITH_ROOT_CLASSES.data.coverage['branches-valid'], 10);

    const complexity = Math.max(
      parseInt(INPUT_FILE2.data.coverage.complexity, 10),
      parseInt(INPUT_FILE_WITH_ROOT_CLASSES.data.coverage.complexity, 10)
    ).toString();

    const lineRate = (totalLinesCovered / totalLinesValid).toString();
    const branchRate = (totalBranchesCovered / totalBranchesValid).toString();

    assert.ok(output.coverage);
    assert.strictEqual(output.coverage['line-rate'], lineRate);
    assert.strictEqual(output.coverage['branch-rate'], branchRate);
    assert.strictEqual(output.coverage['lines-covered'], totalLinesCovered.toString());
    assert.strictEqual(output.coverage['lines-valid'], totalLinesValid.toString());
    assert.strictEqual(output.coverage['branches-covered'], totalBranchesCovered.toString());
    assert.strictEqual(output.coverage['branches-valid'], totalBranchesValid.toString());
    assert.strictEqual(output.coverage.complexity, complexity);
    assert.ok(Math.abs(parseInt(output.coverage.timestamp, 10) - Date.now()) <= 100, 'timestamp should be within 100ms of now');
    assert.strictEqual(output.coverage.sources![0].source.length, 1);
    assert.strictEqual(output.coverage.sources![0].source[0].$t, process.cwd());
    assert.ok(Array.isArray(output.coverage.packages));
    assert.strictEqual(output.coverage.packages.length, 1);
    assert.ok(Array.isArray((output.coverage.packages[0] as Package).package));
    assert.strictEqual((output.coverage.packages[0] as Package).package.length, 2);

    // Validate first package
    assert.strictEqual((output.coverage.packages[0] as Package).package[0].name, INPUT_FILE2.packageName);
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0]['line-rate'],
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0]['branch-rate'],
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0].complexity,
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0].complexity
    );
    assert.notStrictEqual((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes, null);
    assert.deepStrictEqual(
      (output.coverage.packages[0] as Package).package[0].classes,
      ((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes as Class[]).map(
        (inputClasses: Class) => ({
          class: inputClasses.class.map(inputClass => ({
            ...inputClass,
            filename: path.normalize(INPUT_FILE2.data.coverage.sources![0].source[0].$t + '/' + inputClass.filename)
          }))
        })
      )
    );

    // Validate second package
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1].name,
      INPUT_FILE_WITH_ROOT_CLASSES.packageName
    );
    assert.strictEqual((output.coverage.packages[0] as Package).package[1]['line-rate'], lineRate);
    assert.strictEqual((output.coverage.packages[0] as Package).package[1]['branch-rate'], branchRate);
    assert.strictEqual((output.coverage.packages[0] as Package).package[1].complexity, complexity);
    assert.deepStrictEqual(
      (output.coverage.packages[0] as Package).package[1].classes,
      (INPUT_FILE_WITH_ROOT_CLASSES.data.coverage.packages[0] as Class).class.map(jsonClass => ({
        class: [
          {
            ...jsonClass,
            filename: path.normalize(INPUT_FILE_WITH_ROOT_CLASSES.data.coverage.sources![0].source[0].$t + '/' + jsonClass.filename)
          }
        ]
      }))
    );
  });

  it('should merge two files, one of which has a package but no classes, into a single file', () => {
    const output = mergeInputs([INPUT_FILE2, EMPTY_INPUT_FILE_WITHOUT_CLASSES]);

    const totalLinesCovered =
      parseInt(INPUT_FILE2.data.coverage['lines-covered'], 10) +
      parseInt(EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage['lines-covered'], 10);
    const totalLinesValid =
      parseInt(INPUT_FILE2.data.coverage['lines-valid'], 10) +
      parseInt(EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage['lines-valid'], 10);
    const totalBranchesCovered =
      parseInt(INPUT_FILE2.data.coverage['branches-covered'], 10) +
      parseInt(EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage['branches-covered'], 10);
    const totalBranchesValid =
      parseInt(INPUT_FILE2.data.coverage['branches-valid'], 10) +
      parseInt(EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage['branches-valid'], 10);

    const complexity = Math.max(
      parseInt(INPUT_FILE2.data.coverage.complexity, 10),
      parseInt(EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.complexity, 10)
    ).toString();

    const lineRate = (totalLinesCovered / totalLinesValid).toString();
    const branchRate = (totalBranchesCovered / totalBranchesValid).toString();

    assert.ok(output.coverage);
    assert.strictEqual(output.coverage['line-rate'], lineRate);
    assert.strictEqual(output.coverage['branch-rate'], branchRate);
    assert.strictEqual(output.coverage['lines-covered'], totalLinesCovered.toString());
    assert.strictEqual(output.coverage['lines-valid'], totalLinesValid.toString());
    assert.strictEqual(output.coverage['branches-covered'], totalBranchesCovered.toString());
    assert.strictEqual(output.coverage['branches-valid'], totalBranchesValid.toString());
    assert.strictEqual(output.coverage.complexity, complexity);
    assert.ok(Math.abs(parseInt(output.coverage.timestamp, 10) - Date.now()) <= 100, 'timestamp should be within 100ms of now');
    assert.strictEqual(output.coverage.sources![0].source.length, 1);
    assert.strictEqual(output.coverage.sources![0].source[0].$t, process.cwd());
    assert.ok(Array.isArray(output.coverage.packages));
    assert.strictEqual(output.coverage.packages.length, 1);
    assert.ok(Array.isArray((output.coverage.packages[0] as Package).package));
    assert.strictEqual((output.coverage.packages[0] as Package).package.length, 2);

    // Validate first package
    assert.strictEqual((output.coverage.packages[0] as Package).package[0].name, INPUT_FILE2.packageName);
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0]['line-rate'],
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0]['branch-rate'],
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[0].complexity,
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0].complexity
    );
    assert.notStrictEqual((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes, null);
    assert.deepStrictEqual(
      (output.coverage.packages[0] as Package).package[0].classes,
      ((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes as Class[]).map(
        (inputClasses: Class) => ({
          class: inputClasses.class.map(inputClass => ({
            ...inputClass,
            filename: path.normalize(INPUT_FILE2.data.coverage.sources![0].source[0].$t + '/' + inputClass.filename)
          }))
        })
      )
    );

    // Validate second package
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1].name,
      `${EMPTY_INPUT_FILE_WITHOUT_CLASSES.packageName}.${
        (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0].name
      }`
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1]['line-rate'],
      (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1]['branch-rate'],
      (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    assert.strictEqual(
      (output.coverage.packages[0] as Package).package[1].complexity,
      (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0].complexity
    );
  });
});
