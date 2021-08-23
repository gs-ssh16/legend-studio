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
  LegendApplication,
  setupLegendApplicationUILibrary,
  WebApplicationNavigatorProvider,
} from '@finos/legend-application';
import { configure as configureReactHotkeys } from 'react-hotkeys';
import { ModuleRegistry as agGrid_ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { LegendQueryApplication } from '../components/LegendQueryApplication';
import { QueryPluginManager } from './QueryPluginManager';
import { Query_GraphPreset } from '../models/Query_GraphPreset';
import { getRootElement } from '@finos/legend-art';
import { CorePureGraphManagerPlugin } from '@finos/legend-graph';

export const setupLegendQueryUILibrary = async (): Promise<void> => {
  // Register module extensions for `ag-grid`
  agGrid_ModuleRegistry.registerModules([ClientSideRowModelModule]);

  configureReactHotkeys({
    // By default, `react-hotkeys` will avoid capturing keys from input tags like <input>, <textarea>, <select>
    // We want to listen to hotkey from every where in the app so we disable that
    // See https://github.com/greena13/react-hotkeys#ignoring-events
    ignoreTags: [],
  });
};

export class LegendQuery extends LegendApplication {
  declare pluginManager: QueryPluginManager;

  static create(): LegendQuery {
    const application = new LegendQuery(QueryPluginManager.create());
    application.withBasePlugins([new CorePureGraphManagerPlugin()]);
    application.withBasePresets([new Query_GraphPreset()]);
    return application;
  }

  async loadApplication(): Promise<void> {
    // Setup React application libraries
    await setupLegendApplicationUILibrary(this.pluginManager, this.log);
    await setupLegendQueryUILibrary();

    // TODO: we can remove this in the future when we modularize core a bit better
    // especially application config
    this.appConfig.setSDLCServerKey('-');
    this.appConfig.setConfigured(true);

    // Render React application
    ReactDOM.render(
      <BrowserRouter basename={this.baseUrl}>
        <WebApplicationNavigatorProvider>
          <LegendQueryApplication
            config={this.appConfig}
            pluginManager={this.pluginManager}
            log={this.log}
          />
        </WebApplicationNavigatorProvider>
      </BrowserRouter>,
      getRootElement(),
    );
  }
}