globalThis.app ||= {};
app.hot = module.hot;
app.hash = () => __webpack_hash__;
app.load = () => import(/* webpackChunkName: 'page' */ './page');
app.other = () => import(/* webpackChunkName: 'other' */ './other');
module.hot.accept();
