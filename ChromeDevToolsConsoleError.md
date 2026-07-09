Chrome Dev Tools Console Error:

7/6/2026 8:12pm:
 
react-dom-client.development.js:4506 Uncaught Error: Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <ClientPageRoot Component={function MasterPage} searchParams={{}} params={{}}>
      <MasterPage params={Promise} searchParams={Promise}>
        <DreamProvider>
          <OneiroAppContent>
            <div className="min-h-scre...">
              <div>
              <div>
              <header>
              <div className="flex-1 fle...">
                <nav>
                <main className="flex-1 ove...">
                  <div className="max-w-7xl ...">
                    <DashboardView onNavigate={function bound dispatchSetState} ...>
                      <div className="space-y-8 ...">
                        <section className="grid grid-...">
                          <div>
                          <div className="glass-pane...">
                            <div>
                            <div className="space-y-3 ...">
                              <h2 className="text-3xl f...">
+                               16
-                               12
                                ...
                              ...
                        ...
                ...
              ...

    at throwOnHydrationMismatch (react-dom-client.development.js:4506:11)
    at completeWork (react-dom-client.development.js:11825:26)
    at runWithFiberInDEV (react-dom-client.development.js:872:30)
    at completeUnitOfWork (react-dom-client.development.js:15863:19)
    at performUnitOfWork (react-dom-client.development.js:15744:11)
    at workLoopConcurrentByScheduler (react-dom-client.development.js:15721:9)
    at renderRootConcurrent (react-dom-client.development.js:15696:15)
    at performWorkOnRoot (react-dom-client.development.js:14990:13)
    at performWorkOnRootViaSchedulerTask (react-dom-client.development.js:16816:7)
    at MessagePort.performWorkUntilDeadline (scheduler.development.js:45:48)
throwOnHydrationMismatch @ react-dom-client.development.js:4506
completeWork @ react-dom-client.development.js:11825
runWithFiberInDEV @ react-dom-client.development.js:872
completeUnitOfWork @ react-dom-client.development.js:15863
performUnitOfWork @ react-dom-client.development.js:15744
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<h2>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
DashboardView @ DashboardView.tsx:96
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<DashboardView>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
OneiroAppContent @ page.tsx:205
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<OneiroAppContent>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
MasterPage @ page.tsx:402
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10858
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
<MasterPage>
exports.jsx @ react-jsx-runtime.development.js:323
ClientPageRoot @ client-page.js:20
react_stack_bottom_frame @ react-dom-client.development.js:23584
renderWithHooksAgain @ react-dom-client.development.js:6893
renderWithHooks @ react-dom-client.development.js:6805
updateFunctionComponent @ react-dom-client.development.js:9247
beginWork @ react-dom-client.development.js:10807
runWithFiberInDEV @ react-dom-client.development.js:872
performUnitOfWork @ react-dom-client.development.js:15727
workLoopConcurrentByScheduler @ react-dom-client.development.js:15721
renderRootConcurrent @ react-dom-client.development.js:15696
performWorkOnRoot @ react-dom-client.development.js:14990
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16816
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM782 <anonymous>:1
initializeElement @ react-server-dom-webpack-client.browser.development.js:1376
eval @ react-server-dom-webpack-client.browser.development.js:3126
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1273
resolveModelChunk @ react-server-dom-webpack-client.browser.development.js:1127
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2958
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2825
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:3028
progress @ react-server-dom-webpack-client.browser.development.js:3294
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:2091
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:3155
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3540
eval @ app-index.js:130
(app-pages-browser)/./node_modules/next/dist/client/app-index.js @ main-app.js?v=1783382944356:149
(anonymous) @ webpack.js:1
__webpack_require__ @ webpack.js:1
(anonymous) @ webpack.js:1
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:59
loadScriptsInSequence @ app-bootstrap.js:24
appBootstrap @ app-bootstrap.js:53
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1783382944356:171
(anonymous) @ webpack.js:1
__webpack_require__ @ webpack.js:1
__webpack_exec__ @ main-app.js?v=1783382944356:1878
(anonymous) @ main-app.js?v=1783382944356:1879
(anonymous) @ webpack.js:1
(anonymous) @ main-app.js?v=1783382944356:9
