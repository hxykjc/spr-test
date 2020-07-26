import Color from "color";
import Head from "next/head";
import Layout from "../layouts/index";
import { useState, useEffect } from "react";
import getNotionData from '../lib/notion'

export default function Page({ sections, etag, meta }) {
  const focused = useFocus();
  useEffect(
    () => {
      if (focused) {
        fetch(window.location, {
          headers: {
            pragma: "no-cache"
          }
        }).then(async res => {
          const text = await res.text()

          if (text.indexOf(etag) === -1) {
            window.location.reload();
          }
        }).catch(() => {});
      }
    },
    [focused]
  );

  const color = Color(meta.color ? meta.color[0][0] : "#49fcd4");
  const color2 = color.darken(0.4);
  const color3 = color2.lighten(0.1);

  return (
    <a href="/">点我跳转到本尊</a>
  );
}

export async function unstable_getStaticProps() {
  const notionData = await getNotionData()
  const { sections, meta } = notionData

  const etag = require("crypto")
    .createHash("md5")
    .update(JSON.stringify(notionData))
    .digest("hex");

  return {
    props: {
      etag,
      meta,
      sections,
    },
    revalidate: 1
  }
};

function renderText(title) {
  return title.map(chunk => {
    let wrapper = <span>{chunk[0]}</span>;

    (chunk[1] || []).forEach(el => {
      wrapper = React.createElement(el[0], {}, wrapper);
    });

    return wrapper;
  });
}

function NotionImage({ src }) {
  if (src) {
    return <img title="image" src={src} />;
  } else {
    return <div />;
  }
}

const useFocus = () => {
  const [state, setState] = useState(null);
  const onFocusEvent = event => {
    setState(true);
  };
  const onBlurEvent = event => {
    setState(false);
  };
  useEffect(() => {
    window.addEventListener("focus", onFocusEvent);
    window.addEventListener("blur", onBlurEvent);
    return () => {
      window.removeEventListener("focus", onFocusEvent);
      window.removeEventListener("blur", onBlurEvent);
    };
  });
  return state;
};
