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

import { uniqBy } from '@finos/legend-shared';
import type { DataCubeConfiguration } from '../../core/model/DataCubeConfiguration.js';
import { DataCubeColumnKind } from '../../core/DataCubeQueryEngine.js';
import { type DataCubeSnapshot } from '../../core/DataCubeSnapshot.js';
import { _findCol, _toCol } from '../../core/model/DataCubeColumn.js';
import {
  DataCubeEditorColumnsSelectorColumnState,
  DataCubeEditorColumnsSelectorState,
} from './DataCubeEditorColumnsSelectorState.js';
import type { DataCubeQueryEditorPanelState } from './DataCubeEditorPanelState.js';
import type { DataCubeEditorState } from './DataCubeEditorState.js';

export class DataCubeEditorVerticalPivotColumnsSelectorState extends DataCubeEditorColumnsSelectorState<DataCubeEditorColumnsSelectorColumnState> {
  override cloneColumn(
    column: DataCubeEditorColumnsSelectorColumnState,
  ): DataCubeEditorColumnsSelectorColumnState {
    return new DataCubeEditorColumnsSelectorColumnState(
      column.name,
      column.type,
    );
  }

  override get availableColumns() {
    return this._editor.columnProperties.columns
      .filter(
        (column) =>
          column.kind === DataCubeColumnKind.DIMENSION &&
          // exclude group-level extended columns
          !_findCol(this._editor.groupExtendColumns, column.name) &&
          // exclude pivot columns
          !_findCol(
            this._editor.horizontalPivots.selector.selectedColumns,
            column.name,
          ),
      )
      .map(
        (col) =>
          new DataCubeEditorColumnsSelectorColumnState(col.name, col.type),
      );
  }
}

export class DataCubeEditorVerticalPivotsPanelState
  implements DataCubeQueryEditorPanelState
{
  readonly selector!: DataCubeEditorVerticalPivotColumnsSelectorState;

  constructor(editor: DataCubeEditorState) {
    this.selector = new DataCubeEditorVerticalPivotColumnsSelectorState(editor);
  }

  adaptPropagatedChanges(): void {
    this.selector.setSelectedColumns(
      this.selector.selectedColumns.filter((column) =>
        _findCol(this.selector.availableColumns, column.name),
      ),
    );
  }

  applySnaphot(
    snapshot: DataCubeSnapshot,
    configuration: DataCubeConfiguration,
  ) {
    this.selector.setSelectedColumns(
      (snapshot.data.groupBy?.columns ?? []).map(
        (col) =>
          new DataCubeEditorColumnsSelectorColumnState(col.name, col.type),
      ),
    );
  }

  buildSnapshot(newSnapshot: DataCubeSnapshot, baseSnapshot: DataCubeSnapshot) {
    newSnapshot.data.groupBy = this.selector.selectedColumns.length
      ? {
          columns: this.selector.selectedColumns.map(_toCol),
        }
      : undefined;
    newSnapshot.data.selectColumns = uniqBy(
      [...newSnapshot.data.selectColumns, ...this.selector.selectedColumns],
      (col) => col.name,
    ).map(_toCol);
  }
}
