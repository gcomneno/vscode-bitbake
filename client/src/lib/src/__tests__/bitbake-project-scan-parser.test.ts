/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2026 Savoir-faire Linux. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { parseLayersOutput, parseRecipesOutput } from '../BitbakeProjectScanParser'

describe('BitBake project scan parser', () => {
  const layers = [
    {
      name: 'meta-variscite-bsp-imx',
      path: '/work/sources/meta-variscite-bsp-imx',
      priority: 6
    },
    {
      name: 'meta',
      path: '/work/sources/poky/meta',
      priority: 5
    }
  ]

  it('keeps all recipe entries and places a non-skipped entry first', () => {
    const output = `=== Available recipes: ===
freertos-variscite:
  meta-variscite-bsp-imx  2.9.x (skipped: incompatible with machine imx8mm-var-dart (not in COMPATIBLE_MACHINE))
  meta-variscite-bsp-imx  2.15.x`

    const recipes = parseRecipesOutput(output, layers)
    const freertosRecipes = recipes.filter((recipe) => recipe.name === 'freertos-variscite')

    expect(freertosRecipes).toHaveLength(2)
    expect(freertosRecipes.map((recipe) => recipe.version)).toEqual(['2.15.x', '2.9.x'])
    expect(freertosRecipes[0]).toEqual(
      expect.objectContaining({
        name: 'freertos-variscite',
        version: '2.15.x',
        skipped: undefined,
        layerInfo: expect.objectContaining({
          name: 'meta-variscite-bsp-imx'
        })
      })
    )
    expect(freertosRecipes[1]).toEqual(
      expect.objectContaining({
        name: 'freertos-variscite',
        version: '2.9.x',
        skipped: undefined,
        layerInfo: expect.objectContaining({
          name: 'meta-variscite-bsp-imx'
        })
      })
    )
  })

  it('keeps a skipped recipe entry when no compatible version is listed', () => {
    const output = `=== Available recipes: ===
systemd:
  meta  257.3 (skipped: one of 'systemd' needs to be in DISTRO_FEATURES)`

    const recipes = parseRecipesOutput(output, layers)
    const recipe = recipes.find((recipe) => recipe.name === 'systemd')

    expect(recipe).toEqual(
      expect.objectContaining({
        name: 'systemd',
        version: '257.3',
        skipped: expect.stringContaining('skipped:')
      })
    )
  })
})


describe('BitBake layer scan parser', () => {
  it('parses layers from bitbake-layers show-layers output', () => {
    const output = `NOTE: Starting bitbake server...
layer                 path                                      priority
==========================================================================
core                  /work/sources/poky/meta                  5
meta-poky             /work/sources/poky/meta-poky             5
meta-openembedded     /work/sources/meta-openembedded           5`

    expect(parseLayersOutput(output)).toEqual([
      {
        name: 'core',
        path: '/work/sources/poky/meta',
        priority: 5
      },
      {
        name: 'meta-poky',
        path: '/work/sources/poky/meta-poky',
        priority: 5
      },
      {
        name: 'meta-openembedded',
        path: '/work/sources/meta-openembedded',
        priority: 5
      }
    ])
  })

  it('fails when the layer table cannot be found', () => {
    expect(() => {
      parseLayersOutput('no layer table here')
    }).toThrow('Failed to find layers in bitbake-layers output')
  })
})
