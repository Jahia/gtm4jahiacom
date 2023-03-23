window.addEventListener('DOMContentLoaded', (event) => {
    window.dataLayer = window.dataLayer || [];
    //Event info
    if(window.gtm4?.pageInfo)
        window.dataLayer.push(window.gtm4.pageInfo);

    //Event click_main_cta
    window.gtm4.cta_types = [
        {name:'main_cta_demo', value:'demo'},
        {name:'main_cta_free_trial', value:'free_trial'},
        {name:'main_cta_contact', value:'contact'},
        {name:'main_cta_ressource', value:'ressource'},
        {name:'main_cta_upgrade', value:'upgrade'},
        {name:'main_cta_webinar', value:'webinar'}
    ]
    const gtm4_tracked_ctas = []
    document.querySelectorAll('a, button').forEach(element => {
        const cta = element.closest('.main_cta') || element.querySelector('.main_cta');
        if (cta && !gtm4_tracked_ctas.includes(cta)) {
            gtm4_tracked_ctas.push(cta);
            element.addEventListener("click", event => {
                // event.preventDefault();
                window.dataLayer.push({
                    event: 'click_main_cta',
                    cta_type: window.gtm4.cta_types.find(({name}) => cta.classList.contains(name))?.value || 'default',
                    cta_origin: window.location.href,
                    cta_label: cta.innerText.trim()
                });
                return true;
            })
        }
    });

    // document.querySelectorAll('a.main_cta, button.main_cta, .main_cta a, .main_cta button, span.main_cta').forEach(element => {
    //     const cta = element.closest('.main_cta');
    //     if(!gtm4_tracked_ctas.includes(cta)){
    //         gtm4_tracked_ctas.push(cta);
    //         element.addEventListener("click", event => {
    //             if (cta) {
    //                 window.dataLayer.push({
    //                     event: 'click_main_cta',
    //                     cta_type: window.gtm4.cta_types.find(({name}) => cta.classList.contains(name))?.value || 'default',
    //                     cta_origin: window.location.href,
    //                     cta_label: cta.innerText.trim()
    //                 });
    //             }
    //         })
    //     }
    // });

    // document.addEventListener("click", event => {
    //     const target = event.target;
    //     const isCtaNode = target.nodeName === 'BUTTON' || target.nodeName === 'A' || target.childElementCount === 0;
    //     if(isCtaNode){
    //         const cta = target.closest('.main_cta');
    //         if (cta) {
    //             window.dataLayer.push({
    //                 event: 'click_main_cta',
    //                 cta_type: window.gtm4.cta_types.find(({name}) => cta.classList.contains(name))?.value || 'default',
    //                 cta_origin: window.location.href,
    //                 cta_label: cta.innerText.trim()
    //             });
    //         }
    //     }
    // });

    //Event view_main_cta
})
