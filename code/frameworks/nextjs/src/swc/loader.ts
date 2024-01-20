import { getProjectRoot } from '@storybook/core/dist/modules/core-common/index';
import { getVirtualModules } from '@storybook/builder-webpack5';
import type { Options } from '@storybook/core/dist/modules/types/index';
import type { NextConfig } from 'next';
import path from 'path';
import loadJsConfig from 'next/dist/build/load-jsconfig';

export const configureSWCLoader = async (
  baseConfig: any,
  options: Options,
  nextConfig: NextConfig
) => {
  const isDevelopment = options.configType !== 'PRODUCTION';

  const dir = getProjectRoot();

  const { virtualModules } = await getVirtualModules(options);

  const { jsConfig } = await loadJsConfig(dir, nextConfig as any);

  baseConfig.module.rules = [
    ...baseConfig.module.rules,
    {
      test: /\.((c|m)?(j|t)sx?)$/,
      include: [getProjectRoot()],
      exclude: [/(node_modules)/, ...Object.keys(virtualModules)],
      enforce: 'post',
      use: {
        // we use our own patch because we need to remove tracing from the original code
        // which is not possible otherwise
        loader: require.resolve('./swc/next-swc-loader-patch.js'),
        options: {
          isServer: false,
          rootDir: dir,
          pagesDir: `${dir}/pages`,
          appDir: `${dir}/apps`,
          hasReactRefresh: isDevelopment,
          jsConfig,
          nextConfig,
          supportedBrowsers: require('next/dist/build/utils').getSupportedBrowsers(
            dir,
            isDevelopment
          ),
          swcCacheDir: path.join(dir, nextConfig?.distDir ?? '.next', 'cache', 'swc'),
          bundleTarget: 'default',
        },
      },
    },
  ];
};
