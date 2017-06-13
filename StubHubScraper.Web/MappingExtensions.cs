using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using AutoMapper;

using StubHubScraper.Data.Domain;
using StubHubScraper.Web.Models;

namespace StubHubScraper.Web
{
    public class ProxyConverter<TSource, TDestination> : ITypeConverter<TSource, TDestination>
        where TSource : class
        where TDestination : class
    {
        public TDestination Convert(ResolutionContext context)
        {
            // Get dynamic proxy base type
            var baseType = context.SourceValue.GetType().BaseType;

            // Return regular map if base type == Abstract base type
            if (baseType == typeof(TSource))
                baseType = context.SourceValue.GetType();

            // Look up map for base type
            var destType = (from maps in Mapper.GetAllTypeMaps()
                            where maps.SourceType == baseType
                            select maps).FirstOrDefault().DestinationType;

            return Mapper.DynamicMap(context.SourceValue, baseType, destType) as TDestination;
        }
    }

    public static class MappingExtensions
    {


    }
}