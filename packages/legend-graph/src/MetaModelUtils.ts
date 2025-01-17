/**
 * Copyright (c) 2020-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  SOURCE_INFORMATION_KEY,
  ELEMENT_PATH_DELIMITER,
} from './MetaModelConst';
import {
  findLast,
  guaranteeNonNullable,
  hashArray,
  hashObject,
} from '@finos/legend-shared';

export const extractElementNameFromPath = (fullPath: string): string =>
  guaranteeNonNullable(findLast(fullPath.split(ELEMENT_PATH_DELIMITER)));

export const matchFunctionName = (
  functionName: string,
  functionFullPath: string,
): boolean =>
  functionName === functionFullPath ||
  extractElementNameFromPath(functionFullPath) === functionName;

/**
 * This method concatenate 2 fully-qualified elementh paths to form a single one
 * and then extracts the name and package part from it.
 */
export const resolvePackagePathAndElementName = (
  path: string,
  defaultPath?: string,
): [string, string] => {
  const index = path.lastIndexOf(ELEMENT_PATH_DELIMITER);
  if (index === -1) {
    return [defaultPath ?? '', path];
  }
  return [
    path.substring(0, index),
    path.substring(index + ELEMENT_PATH_DELIMITER.length, path.length),
  ];
};

export const createPath = (packagePath: string, name: string): string =>
  `${packagePath ? `${packagePath}${ELEMENT_PATH_DELIMITER}` : ''}${name}`;
// TODO: we might need to support quoted identifier in the future
export const isValidPathIdentifier = (val: string): boolean =>
  Boolean(val.match(/^\w[\w$_-]*$/));
export const isValidFullPath = (fullPath: string): boolean =>
  Boolean(fullPath.match(/^(?:\w[\w$_-]*)(?:::\w[\w$_-]*)+$/));
export const isValidPath = (path: string): boolean =>
  Boolean(path.match(/^(?:\w[\w$_-]*)(?:::\w[\w$_-]*)*$/));

// NOTE: this is over-simplification as there could be source information fields with other names
export const hashObjectWithoutSourceInformation = (val: object): string =>
  hashObject(val, {
    excludeKeys: (key: string) => key === SOURCE_INFORMATION_KEY,
  });

export const fromElementPathToMappingElementId = (className: string): string =>
  className.split(ELEMENT_PATH_DELIMITER).join('_');

export const hashLambda = (
  parameters: object | undefined,
  body: object | undefined,
): string =>
  hashArray([
    parameters ? hashObjectWithoutSourceInformation(parameters) : '',
    body ? hashObjectWithoutSourceInformation(body) : '',
  ]);
