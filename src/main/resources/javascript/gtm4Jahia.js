window.addEventListener('DOMContentLoaded', (event) => {
    window.dataLayer = window.dataLayer || [];

    ((events)=>{
        const ctas_tracked = [];
        const ctas_viewed = [];
        const forms_tracked= [];
        const keys = {
            cta:"main_cta",
            form:"main_form",
            social:"social_network"
        }

        // const getTypeBundle = (key) => [
        //     {name:`main_${key}_demo`, value:'demo'},
        //     {name:`main_${key}_free_trial`, value:'free_trial'},
        //     {name:`main_${key}_contact`, value:'contact'},
        //     {name:`main_${key}_ressource`, value:'ressource'},
        //     {name:`main_${key}_upgrade`, value:'upgrade'},
        //     {name:`main_${key}_webinar`, value:'webinar'}
        // ]
        // const getType = ({node,key}) => getTypeBundle(key).find(({name}) => node.classList.contains(name))?.value || 'default';

        const getType = ({node,key,deft}) => {
            const regex = new RegExp(`${key}_(?<type>[\\w_]+)`);
            const match = regex.exec(node.classList.value);
            return match?.groups?.type || deft;
        }
        const getMktFormId = ({form}) => {
            const regex = new RegExp('mktoForm_(?<formId>[\\w_.-]+)');
            const match = regex.exec(form.id);
            return match?.groups?.formId || null;
        }

        const isInViewport = (el) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };

        //Event info
        if(events?.pageInfo)
            window.dataLayer.push(events.pageInfo);

        //Event click_main_cta
        document.querySelectorAll('a, button').forEach(element => {
            const cta = element.closest(`.${keys.cta}`) || element.querySelector(`.${keys.cta}`);
            if (cta && !ctas_tracked.includes(cta)) {
                ctas_tracked.push(cta);
                element.addEventListener("click", event => {
                    // event.preventDefault();
                    window.dataLayer.push({
                        event: 'click_main_cta',
                        cta_type: getType({node:cta,key:keys.cta,deft:'default'}),
                        cta_origin: window.location.href,
                        cta_label: cta.innerText.trim()
                    });
                    return true;
                })
            }
        });

        //Event view_main_cta
        const checkVisibleCTAs = () => {
            //load view event only one time and not for .main_cta_header
            const ctas = ctas_tracked.filter(cta => !ctas_viewed.includes(cta) && !cta.classList.contains("main_cta_header"));
            ctas.forEach(cta => {
                if(isInViewport(cta)){
                    ctas_viewed.push(cta);
                    window.dataLayer.push({
                        event: 'view_main_cta',
                        cta_type: getType({node:cta,key:keys.cta,deft:'default'}),
                        cta_origin: window.location.href,
                        cta_label: cta.innerText.trim()
                    });
                }
            })
        }
        document.addEventListener('scroll', checkVisibleCTAs);
        document.addEventListener('resize', checkVisibleCTAs);

        //Event generate_lead
        Array.from(document.getElementsByTagName('form')).forEach(form =>{
            const node = form.closest(`.${keys.form}`) || form.querySelector(`.${keys.form}`);
            if (node && !forms_tracked.includes(node)) {
                forms_tracked.push(node);

                form.addEventListener("submit", event => {
                    const getData = () => ({
                        event: 'generate_lead',
                        form_type: getType({node,key:keys.form,deft:'default'}),
                        form_origin: window.location.href,
                        country: form.querySelector('select[name="Country"]')?.value || null,
                        you_are: form.querySelector('input[name="Lead_Type__c"]:checked')?.value || null,
                        company_size: form.querySelector('select[name="Employees_Range__c"]')?.value || null,
                        job_title: form.querySelector('input[name="Title"]')?.value || null,
                        email: form.querySelector('input[name="Email"]')?.value || null,
                        phone: form.querySelector('input[name="Phone"]')?.value || null,
                        firstname: form.querySelector('input[name="FirstName"]')?.value || null,
                        lastname: form.querySelector('input[name="LastName"]')?.value || null
                    })

                    const marketoForm = window.MktoForms2?.getForm(getMktFormId({form}));
                    if(marketoForm){
                        // console.log("handle marketo form");
                        marketoForm.onSuccess((values,targetPageUrl) =>{
                            window.dataLayer.push(getData());
                            // alert("cheri ca va couper !");
                        })
                    }else{
                        // console.log("handle form");
                        window.dataLayer.push(getData());
                    }
                })
            }
        })

        // document.addEventListener("submit", event => {
        //     // event.preventDefault();
        //     const form = event.target;
        //     const node = form.closest(`.${keys.form}`) || form.querySelector(`.${keys.form}`);
        //     if (node) {
        //         window.dataLayer.push({
        //             event: 'generate_lead',
        //             form_type: getType({node,key:keys.form,deft:'default'}),
        //             form_origin: window.location.href,
        //             country: form.querySelector('select[name="Country"]')?.value || null,
        //             you_are: form.querySelector('input[name="Lead_Type__c"]')?.value || null,
        //             company_size: form.querySelector('input[name="Employees_Range__c"]')?.value || null,
        //             job_title: form.querySelector('input[name="Title"]')?.value || null
        //         });
        //         //TODO remove after test
        //         alert("continue ?");
        //     }
        //     // return true;
        // })

        //click_social_network
        document.querySelectorAll('a, button').forEach(element => {
            const node = element.closest(`.${keys.social}`) || element.querySelector(`.${keys.social}`);
            if (node) {
                element.addEventListener("click", event => {
                    // event.preventDefault();
                    window.dataLayer.push({
                        event: 'click_social_network',
                        social_network: getType({node,key:keys.social,deft:'n/a'})
                    });
                    return true;
                })
            }
        });

        //login
        // if(events?.userLogged){
        //     const storageKey = "gtm4UserLogged";
        //     const userLogged = localStorage.getItem(storageKey) ? JSON.parse(localStorage.getItem(storageKey)) : null;
        //     if(userLogged)
        //         return;
        //
        //     localStorage.setItem(storageKey, JSON.stringify(true))
        //     window.dataLayer.push({
        //         event: 'login',
        //         login_origin: window.location.host
        //     });
        // }
        document.addEventListener("submit", event => {
            // event.preventDefault();
            const storageKey = "gtm4UserLogged";
            const userLogged = sessionStorage.getItem(storageKey) ? JSON.parse(localStorage.getItem(storageKey)) : null;
            if(!userLogged){
                const form = event.target;
                if (form.getAttribute("name") === "loginForm") {
                    window.dataLayer.push({
                        event: 'login',
                        login_origin: window.location.host
                    });
                    sessionStorage.setItem(storageKey, JSON.stringify(true))
                }
            }
            return true;
        })

    })(window.gtm4)




    //Event click_main_cta OLD versions

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


})
