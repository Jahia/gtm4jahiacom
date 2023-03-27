package org.jahia.se.modules.gtm4jahia;

import net.htmlparser.jericho.*;
import org.apache.commons.lang.StringUtils;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRPropertyWrapper;
import org.jahia.services.content.JCRValueWrapper;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.jahia.services.usermanager.JahiaUser;
import org.jetbrains.annotations.NotNull;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component(service = RenderFilter.class)
public class Gtm4JahiaFilter extends AbstractFilter {
    private static Logger logger = LoggerFactory.getLogger(Gtm4JahiaFilter.class);
    private final static String GTM4JAHIA_MODULE="gtm4jahia";
    private final static String GTM4JAHIA_USER_COOKIE_NAME = "internal_jahian_user";
    private final static String GTM4JAHIA_USER_COOKIE_VISITOR_VALUE = "0";
    private final static String GTM4JAHIA_USER_COOKIE_JAHIANS_VALUE = "1";

    private final static String PAGE_CATEGORY_1_PROPS="pageType";
    private final static String PAGE_CATEGORY_2_PROPS="j:nodename";

    @Activate
    public void activate() {
        setPriority(-1);
        setApplyOnModes("live");//,preview
        setApplyOnConfigurations("page");
        setApplyOnTemplateTypes("html");
        setSkipOnConfigurations("include,wrapper");//?
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        String output = super.execute(previousOut, renderContext, resource, chain);
        boolean isInstalled = false;

        JCRPropertyWrapper installedModules = renderContext.getSite().getProperty("j:installedModules");

        for (JCRValueWrapper module : installedModules.getValues()) {
            if (GTM4JAHIA_MODULE.equals(module.getString())) {
                isInstalled = true;
                break;
            }
        }

        //Disable the filter in case we are in Content Editor preview.
        boolean isCEPreview = renderContext.getRequest().getAttribute("ce_preview") != null;

        if(isInstalled && !isCEPreview){
            //cookie management
            manageCookie(renderContext);

            //update output to add scripts
            output = enhanceOutput(output, renderContext);
        }


        return output;
    }

    /**
     * This Function is just to add some logic to our filter and therefore not needed to declare a filter
     *
     * @param output    Original output to modify
     * @return          Modified output
     */
    @NotNull
    private String enhanceOutput(String output, RenderContext renderContext) throws Exception{

        Source source = new Source(output);
        OutputDocument outputDocument = new OutputDocument(source);

        //Add webapp script to the HEAD tag
        List<Element> elementList = source.getAllElements(HTMLElementName.HEAD);
        if (elementList != null && !elementList.isEmpty()) {
            final StartTag headStartTag = elementList.get(0).getStartTag();
            outputDocument.replace(headStartTag.getEnd(), headStartTag.getEnd() + 1, getHeadScript(renderContext));
        }

        output = outputDocument.toString().trim();
        return output;
    }

    private String getHeadScript(RenderContext renderContext) throws RepositoryException {
        List<String> pageCategories = getPageCategories(renderContext);
        StringBuilder headScriptBuilder =
                new StringBuilder("\n<script type=\"application/javascript\">");

        if(!pageCategories.isEmpty()) {
            headScriptBuilder.append("\nwindow.gtm4 = window.gtm4 || {};gtm4.pageInfo = ");
            headScriptBuilder.append("{event: 'info',page_category_1: '" + pageCategories.get(0) + "',page_category_2: '" + pageCategories.get(1)+ "',");
            headScriptBuilder.append("page_identifier: '" + pageCategories.get(2) + "',page_path: '" + pageCategories.get(3) + "'}");
        }
        headScriptBuilder.append( "\n</script>");
        headScriptBuilder.append( "\n<script async type=\"text/javascript\" src=\"/modules/gtm4jahia/javascript/gtm4Jahia.js\"></script>\n<" );
        return headScriptBuilder.toString();
    }

    private List<String> getPageCategories(RenderContext renderContext) throws RepositoryException {
        List<String> pageCategories = new ArrayList<String>();
        JCRNodeWrapper mainResourceNode = renderContext.getMainResource().getNode();
        JCRNodeWrapper pageNode;

        if(mainResourceNode.isNodeType("jnt:page")) {
            pageNode = mainResourceNode;
        }else{
            pageNode = JCRContentUtils.getParentOfType(mainResourceNode,"jnt:page");
        }

        if(pageNode != null) {
            pageCategories.add(
                pageNode.hasProperty(PAGE_CATEGORY_1_PROPS) ?
                    pageNode.getProperty(PAGE_CATEGORY_1_PROPS).getValue().getNode().getProperty("jcr:title").getValue().toString()
                    : "n/a"
            );
            pageCategories.add(pageNode.getProperty(PAGE_CATEGORY_2_PROPS).getValue().toString());
            pageCategories.add(pageNode.getIdentifier());
            pageCategories.add(pageNode.getPath());
        }
        return pageCategories;
    }

    private void manageCookie(RenderContext renderContext){
        HttpServletRequest httpServletRequest = renderContext.getRequest();
        List<Cookie> cookieNextPreviewList = Arrays.stream(httpServletRequest.getCookies()) // convert list to stream
                .filter(cookie -> cookie.getName().equals(GTM4JAHIA_USER_COOKIE_NAME))
                .collect(Collectors.toList());
        //add cookie
        if (cookieNextPreviewList.isEmpty()){
            if(isJahians(renderContext)){
                renderContext.getResponse().addCookie(
                    buildCookie(GTM4JAHIA_USER_COOKIE_JAHIANS_VALUE,getCookiePath(httpServletRequest))
                );
            }else{
                renderContext.getResponse().addCookie(
                    buildCookie(GTM4JAHIA_USER_COOKIE_VISITOR_VALUE,getCookiePath(httpServletRequest))
                );
            }
        }else{
            //update cookie if needed
            Cookie cookie = cookieNextPreviewList.get(0);
            if(cookie.getValue().equals(GTM4JAHIA_USER_COOKIE_VISITOR_VALUE) && isJahians(renderContext))
                renderContext.getResponse().addCookie(
                    buildCookie(GTM4JAHIA_USER_COOKIE_JAHIANS_VALUE,getCookiePath(httpServletRequest))
                );
        }
    }

    private Cookie buildCookie(String value, String path){
        Cookie cookie = new Cookie(GTM4JAHIA_USER_COOKIE_NAME,value);
//        cookie.setValue(value);
        cookie.setPath(path);
        cookie.setMaxAge(365*24*60*60);//1y in sec
        return cookie;
    }
//    private Cookie buildCookie(Cookie cookie, String value, String path){
//        cookie.setValue(value);
//        cookie.setPath(path);
//        cookie.setMaxAge(365*24*60*60);//1y in sec
//        return cookie;
//    }
    private boolean isJahians(RenderContext renderContext){
        JahiaUser user = renderContext.getUser();
        String email = user.getProperty("j:email");
        return (StringUtils.isNotEmpty(email) && email.contains("@jahia.com"));
    }
    private String getCookiePath(HttpServletRequest httpServletRequest){
        String cookiePath = StringUtils.isNotEmpty(httpServletRequest.getContextPath()) ?
                httpServletRequest.getContextPath() : "/";
        return cookiePath;
    }
}
