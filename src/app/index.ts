async function initProd() {
    const { setView } = await import('@/core/view');
    setView('main');

    await import('@/core/config');
}

async function initDev() {
    const { setView } = await import('@/core/view');
    setView('main');

    await import('@/core/config');
}

// =================================================================================================

(async () => {
    await (import.meta.env.PROD ? initProd : initDev).call(null);

    const { loadServiceWorker } = await import('./utils/misc');
    loadServiceWorker();
})();

export {};
