<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>

<c:choose>
    <c:when test="${jcr:isNodeType(renderContext.mainResource.node, 'jnt:page')}">
        <c:set var="pageNode" value="${renderContext.mainResource.node}"/>
    </c:when>
    <c:otherwise>
        <c:set var="pageNode" value="${jcr:getParentOfType(renderContext.mainResource.node,'jnt:page')}"/>
    </c:otherwise>
</c:choose>

<c:set var="page_category_1" value="${pageNode.identifier}"/>
<c:set var="page_category_2" value="${pageNode.displayableName}"/>
<script type="application/javascript">
    window.gtm4 = window.gtm4 || {};
    gtm4.pageInfo = {
        event: 'info',
        page_category_1: '${page_category_1}',
        page_category_2: '${page_category_2}'
    }
</script>
