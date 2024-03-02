import { CoberturaJson } from './types/cobertura';
import * as fs from 'fs';
import { addSelfClosingTags } from './util';
import { XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';

const XML_HEADER = '<?xml version="1.0" ?>\n';

// initialize XMLBuilder
const options: XmlBuilderOptions = {
  ignoreAttributes : false,
  attributeNamePrefix: '',
  textNodeName: '$t',
  suppressBooleanAttributes: false,
};

const builder = new XMLBuilder(options);

export function writeOutput(outputFile: string, output: CoberturaJson): void {
  const outputXml = XML_HEADER + addSelfClosingTags(builder.build(output));
  const outputFilename: string = outputFile;

  fs.writeFileSync(outputFilename, outputXml);
}
