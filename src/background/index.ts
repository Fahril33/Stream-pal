import { broadcastDomainState } from '../shared/messaging';
import { getDomainState, setDomainState } from '../shared/storage';
import type { RuntimeMessage } from '../shared/types';

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  if (message.type === 'VE_GET_STATE') {
    getDomainState(message.hostname).then((enabled) => sendResponse({ enabled }));
    return true;
  }

  if (message.type === 'VE_SET_STATE') {
    setDomainState(message.hostname, message.enabled)
      .then(() => broadcastDomainState(message.hostname, message.enabled))
      .then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Video Enhancer] Extension installed / updated.');
});
