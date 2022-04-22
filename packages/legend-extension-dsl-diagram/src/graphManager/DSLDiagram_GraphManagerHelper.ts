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

import type { BasicModel, PureModel } from '@finos/legend-graph';
import { guaranteeNonNullable } from '@finos/legend-shared';
import { Diagram } from '../models/metamodels/pure/packageableElements/diagram/DSLDiagram_Diagram';

export const getDiagram = (path: string, graph: PureModel): Diagram =>
  graph.getExtensionElement(path, Diagram, `Can't find diagram '${path}'`);

export const getOwnDiagram = (path: string, graph: BasicModel): Diagram =>
  guaranteeNonNullable(
    graph.getOwnNullableExtensionElement(path, Diagram),
    `Can't find diagram '${path}'`,
  );
