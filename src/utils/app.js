import React from 'react';
import {
  Image,
  AsyncStorage,
} from 'react-native';
import md5 from 'md5';
import { APP_AUTH_KEY } from '../config';

// http://phpjs.org/functions/time/
function time() {
  return Math.floor(new Date().getTime() / 1000);
}

// https://github.com/UESTC-BBS/API-Docs/wiki/Mobcent-API#apphash
export function getAppHashValue() {
  let timeStr = time().toString();
  let encryptedTimeStr = md5(timeStr.substr(0, 5) + APP_AUTH_KEY);
  return encryptedTimeStr.substr(8, 8);
}

export function parseContentWithImage(content) {
  if (!content) { return ''; }

  let contentWithEmoticonUrl = content.replace(/\[mobcent_phiz=(https?:\/\/[^\]]+\.(?:jpg|png|gif))\]/g, '___emoticonBoundary___$1___emoticonBoundary___');
  let contentEmoticonUrlArray = contentWithEmoticonUrl.split('___emoticonBoundary___');

  return contentEmoticonUrlArray.map((item, index) => {
    if (/https?:\/\/.+(?:jpg|png|gif)/.test(item)) {
      return (
        <Image
          key={index}
          source={{ uri: item }}
          style={{ height: 30, width: 30, resizeMode: Image.resizeMode.contain, marginTop: 5 }} />
      );
    }

    return item;
  });
}

export function fetchWithToken(
  requestUrl,
  fetchOptions,
  dispatch,
  fetchSuccessCallbackAction,
  fetchSuccessCallbackParameter) {
  return AsyncStorage.getItem('authrization')
    .then(authrization => {
      if (authrization) {
        authrization = JSON.parse(authrization);
        requestUrl += `&accessToken=${authrization.token}` +
                      `&accessSecret=${authrization.secret}`;
      }

      return fetch(requestUrl, fetchOptions)
        .then(response => response.json())
        .then(json => dispatch(fetchSuccessCallbackAction(json, fetchSuccessCallbackParameter)));
    });
}
