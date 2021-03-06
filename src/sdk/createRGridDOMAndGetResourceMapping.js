'use strict';

const {RGridResource} = require('@applitools/eyes-sdk-core');
const createRGridDom = require('./createRGridDom');

function makeCreateRGridDOMAndGetResourceMapping({getAllResources, parseInlineCssFromCdt}) {
  return async function createRGridDOMAndGetResourceMapping({
    url,
    cdt,
    resourceUrls,
    resourceContents,
    frames = [],
  }) {
    const {absoluteUrls, absoluteResourceContents} = parseInlineCssFromCdt({
      resourceUrls,
      resourceContents,
      url,
      cdt,
    });

    const resources = await getAllResources(absoluteUrls, absoluteResourceContents);
    const allResources = Object.assign({}, resources);

    const frameDoms = await Promise.all(frames.map(createRGridDOMAndGetResourceMapping));

    frameDoms.forEach(({rGridDom: frameDom, allResources: frameAllResources}, i) => {
      const frameUrl = frames[i].url;
      allResources[frameUrl] = resources[frameUrl] = createResourceFromFrame(frameUrl, frameDom);
      Object.assign(allResources, frameAllResources);
    });

    Object.assign(allResources, resources);

    const rGridDom = createRGridDom({cdt, resources});

    return {rGridDom, allResources};
  };

  function createResourceFromFrame(frameUrl, frameDom) {
    const frameAsResource = new RGridResource();
    frameAsResource.setUrl(frameUrl);
    frameAsResource.setContentType('x-applitools-html/cdt');
    frameAsResource.setContent(frameDom._getContentAsCdt());
    return frameAsResource;
  }
}

module.exports = makeCreateRGridDOMAndGetResourceMapping;
