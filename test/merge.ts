import chai, { expect } from 'chai';
import chaiAlmost from 'chai-almost';
import chaiArrays from 'chai-arrays';
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

chai.use(chaiAlmost(100));
chai.use(chaiArrays);

describe('mergeInputs', () => {
  it('should merge a single empty file', () => {
    const output = mergeInputs([EMPTY_INPUT_FILE]);

    expect(output.coverage).to.exist;
    expect(output.coverage['line-rate']).to.equal(EMPTY_INPUT_FILE.data.coverage['line-rate']);
    expect(output.coverage['branch-rate']).to.equal(EMPTY_INPUT_FILE.data.coverage['branch-rate']);
    expect(output.coverage['lines-covered']).to.equal(EMPTY_INPUT_FILE.data.coverage['lines-covered']);
    expect(output.coverage['lines-valid']).to.equal(EMPTY_INPUT_FILE.data.coverage['lines-valid']);
    expect(output.coverage['branches-covered']).to.equal(EMPTY_INPUT_FILE.data.coverage['branches-covered']);
    expect(output.coverage['branches-valid']).to.equal(EMPTY_INPUT_FILE.data.coverage['branches-valid']);
    expect(output.coverage.complexity).to.equal(EMPTY_INPUT_FILE.data.coverage.complexity);
    expect(parseInt(output.coverage.timestamp, 10)).to.be.almost(Date.now(), 100);
    expect(output.coverage.sources).to.be.array();
    expect(output.coverage.sources!.length).to.equal(1);
    expect(output.coverage.sources![0].source.length).to.equal(1);
    expect(output.coverage.sources![0].source[0].$t).to.equal(process.cwd());
    expect(output.coverage.packages).to.be.array();
    expect(output.coverage.packages.length).to.equal(1);
    expect((output.coverage.packages as Package[])[0].package).to.be.array();
    expect((output.coverage.packages as Package[])[0].package.length).to.equal(0);
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

    expect(output.coverage).to.exist;
    expect(output.coverage['line-rate']).to.equal((totalLinesCovered / totalLinesValid).toString());
    expect(output.coverage['branch-rate']).to.equal((totalBranchesCovered / totalBranchesValid).toString());
    expect(output.coverage['lines-covered']).to.equal(totalLinesCovered.toString());
    expect(output.coverage['lines-valid']).to.equal(totalLinesValid.toString());
    expect(output.coverage['branches-covered']).to.equal(totalBranchesCovered.toString());
    expect(output.coverage['branches-valid']).to.equal(totalBranchesValid.toString());
    expect(output.coverage.complexity).to.equal(complexity.toString());
    expect(parseInt(output.coverage.timestamp, 10)).to.be.almost(Date.now(), 100);
    expect(output.coverage.sources).to.be.array();
    expect(output.coverage.sources!.length).to.equal(1);
    expect(output.coverage.sources![0].source.length).to.equal(1);
    expect(output.coverage.sources![0].source[0].$t).to.equal(process.cwd());
    expect(output.coverage.packages).to.be.array();
    expect(output.coverage.packages.length).to.equal(1);
    expect((output.coverage.packages[0] as Package).package).to.be.array();
    expect((output.coverage.packages[0] as Package).package.length).to.equal(2);

    // Validate first output package
    expect((output.coverage.packages[0] as Package).package[0].name).to.equal(
      `${INPUT_FILE1.packageName}.${(INPUT_FILE1.data.coverage.packages[0] as Package).package[0].name}`
    );
    expect((output.coverage.packages[0] as Package).package[0]['line-rate']).to.equal(
      (INPUT_FILE1.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    expect((output.coverage.packages[0] as Package).package[0]['branch-rate']).to.equal(
      (INPUT_FILE1.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    expect((output.coverage.packages[0] as Package).package[0].complexity).to.equal(
      (INPUT_FILE1.data.coverage.packages[0] as Package).package[0].complexity
    );

    expect((INPUT_FILE1.data.coverage.packages[0] as Package).package[0].classes).to.not.equal(null);

    expect((output.coverage.packages[0] as Package).package[0].classes).to.deep.equal(
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
    expect((output.coverage.packages[0] as Package).package[1].name).to.equal(INPUT_FILE2.packageName);
    expect((output.coverage.packages[0] as Package).package[1]['line-rate']).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    expect((output.coverage.packages[0] as Package).package[1]['branch-rate']).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    expect((output.coverage.packages[0] as Package).package[1].complexity).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0].complexity
    );
    expect((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes).to.not.equal(null);
    expect((output.coverage.packages[0] as Package).package[1].classes).to.deep.equal(
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

    expect(output.coverage).to.exist;
    expect(output.coverage['line-rate']).to.equal(lineRate);
    expect(output.coverage['branch-rate']).to.equal(branchRate);
    expect(output.coverage['lines-covered']).to.equal(totalLinesCovered.toString());
    expect(output.coverage['lines-valid']).to.equal(totalLinesValid.toString());
    expect(output.coverage['branches-covered']).to.equal(totalBranchesCovered.toString());
    expect(output.coverage['branches-valid']).to.equal(totalBranchesValid.toString());
    expect(output.coverage.complexity).to.equal(complexity);
    expect(parseInt(output.coverage.timestamp, 10)).to.be.almost(Date.now(), 100);
    expect(output.coverage.sources![0].source.length).to.equal(1);
    expect(output.coverage.sources![0].source[0].$t).to.equal(process.cwd());
    expect(output.coverage.packages).to.be.array();
    expect(output.coverage.packages.length).to.equal(1);
    expect((output.coverage.packages[0] as Package).package).to.be.array();
    expect((output.coverage.packages[0] as Package).package.length).to.equal(2);

    // Validate first package
    expect((output.coverage.packages[0] as Package).package[0].name).to.equal(INPUT_FILE2.packageName);
    expect((output.coverage.packages[0] as Package).package[0]['line-rate']).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    expect((output.coverage.packages[0] as Package).package[0]['branch-rate']).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    expect((output.coverage.packages[0] as Package).package[0].complexity).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0].complexity
    );
    expect((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes).to.not.equal(null);
    expect((output.coverage.packages[0] as Package).package[0].classes).to.deep.equal(
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
    expect((output.coverage.packages[0] as Package).package[1].name).to.equal(
      INPUT_FILE_WITH_ROOT_CLASSES.packageName
    );
    expect((output.coverage.packages[0] as Package).package[1]['line-rate']).to.equal(lineRate);
    expect((output.coverage.packages[0] as Package).package[1]['branch-rate']).to.equal(branchRate);
    expect((output.coverage.packages[0] as Package).package[1].complexity).to.equal(complexity);
    expect((output.coverage.packages[0] as Package).package[1].classes).to.deep.equal(
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

    expect(output.coverage).to.exist;
    expect(output.coverage['line-rate']).to.equal(lineRate);
    expect(output.coverage['branch-rate']).to.equal(branchRate);
    expect(output.coverage['lines-covered']).to.equal(totalLinesCovered.toString());
    expect(output.coverage['lines-valid']).to.equal(totalLinesValid.toString());
    expect(output.coverage['branches-covered']).to.equal(totalBranchesCovered.toString());
    expect(output.coverage['branches-valid']).to.equal(totalBranchesValid.toString());
    expect(output.coverage.complexity).to.equal(complexity);
    expect(parseInt(output.coverage.timestamp, 10)).to.be.almost(Date.now(), 100);
    expect(output.coverage.sources![0].source.length).to.equal(1);
    expect(output.coverage.sources![0].source[0].$t).to.equal(process.cwd());
    expect(output.coverage.packages).to.be.array();
    expect(output.coverage.packages.length).to.equal(1);
    expect((output.coverage.packages[0] as Package).package).to.be.array();
    expect((output.coverage.packages[0] as Package).package.length).to.equal(2);

    // Validate first package
    expect((output.coverage.packages[0] as Package).package[0].name).to.equal(INPUT_FILE2.packageName);
    expect((output.coverage.packages[0] as Package).package[0]['line-rate']).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    expect((output.coverage.packages[0] as Package).package[0]['branch-rate']).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    expect((output.coverage.packages[0] as Package).package[0].complexity).to.equal(
      (INPUT_FILE2.data.coverage.packages[0] as Package).package[0].complexity
    );
    expect((INPUT_FILE2.data.coverage.packages[0] as Package).package[0].classes).to.not.equal(null);
    expect((output.coverage.packages[0] as Package).package[0].classes).to.deep.equal(
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
    expect((output.coverage.packages[0] as Package).package[1].name).to.equal(
      `${EMPTY_INPUT_FILE_WITHOUT_CLASSES.packageName}.${
        (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0].name
      }`
    );
    expect((output.coverage.packages[0] as Package).package[1]['line-rate']).to.equal(
      (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0]['line-rate']
    );
    expect((output.coverage.packages[0] as Package).package[1]['branch-rate']).to.equal(
      (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0]['branch-rate']
    );
    expect((output.coverage.packages[0] as Package).package[1].complexity).to.equal(
      (EMPTY_INPUT_FILE_WITHOUT_CLASSES.data.coverage.packages[0] as Package).package[0].complexity
    );
  });
});
