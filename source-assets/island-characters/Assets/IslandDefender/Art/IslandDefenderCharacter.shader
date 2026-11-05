Shader "TreasureIsland/IslandDefender/Character Toon"
{
    Properties
    {
        [MainTexture] _MainTex ("Main Texture (RGB)", 2D) = "white" {}
        [MainColor] _Color ("Color", Color) = (1, 1, 1, 1)
        [Enum(Classic,1,Toon,2)] _LightModel ("Lighting", Float) = 2
        _ToonCutoff ("Toon Cutoff", Range(0,1)) = 0.5
        _ToonSmoothness ("Toon Smoothness", Range(0,1)) = 0.5
        [Toggle] _HueShiftEnabled ("Hue Correction", Float) = 0
        _HueShift ("Hue Shift (Degrees)", Range(0,360)) = 0
        _HueSaturation ("Saturation", Range(0,4)) = 1
        _HueBrightness ("Brightness", Range(0,2)) = 1
        [Enum(None,0,Simple,1)] _OutlineType ("Outline", Float) = 1
        [Enum(World,0,Pixels,1)] _OutlineWidthMode ("Outline Width Mode", Float) = 1
        _OutlineWidthPixels ("Outline Width (Render Pixels)", Range(0,4)) = 1
        _OutlineThickness ("Outline Width (World Centimeters)", Range(0,10)) = 1
        [ToggleUI] _OutlineVertexAlpha ("Use Vertex Alpha For Outline Width", Float) = 0
        [HDR] _OutlineColor ("Outline Color", Color) = (0,0,0,1)
        _OutlineLightStrength ("Outline Light Strength", Range(0,1)) = 1
        [HDR] _OutlineLightColor ("Outline Light Color", Color) = (1,0.85,0.6,1)
        _OutlineLightThreshold ("Outline Light Threshold", Range(0,1)) = 0.35
        _OutlineLightSoftness ("Outline Light Softness", Range(0.01,0.5)) = 0.15
        _OutlineLightColorInfluence ("Outline Light Color Influence", Range(0,1)) = 0.25
    }

    SubShader
    {
        Tags { "Queue"="Geometry" "RenderType"="Opaque" }
        LOD 200
        Cull Back
        ZWrite On
        ZTest LEqual
        Blend Off

        CGINCLUDE
        #include "UnityCG.cginc"
        #include "Lighting.cginc"
        #include "AutoLight.cginc"

        sampler2D _MainTex;
        float4 _MainTex_ST;
        float4 _Color;
        float _LightModel, _ToonCutoff, _ToonSmoothness;
        float _HueShiftEnabled, _HueShift, _HueSaturation, _HueBrightness;
        float _OutlineType, _OutlineThickness;
        float _OutlineWidthMode, _OutlineWidthPixels, _OutlineVertexAlpha;
        float4 _OutlineColor;
        float4 _OutlineLightColor;
        float _OutlineLightStrength, _OutlineLightThreshold, _OutlineLightSoftness;
        float _OutlineLightColorInfluence;
        // 全局属性不放入 Properties，避免被材质序列化值覆盖。
        float _IslandDefenderUseCharacterOutlinePalette;
        float4 _IslandDefenderCharacterOutlineDarkColor;
        float4 _IslandDefenderCharacterOutlineLightColor;
        float _IslandDefenderCharacterOutlineLightColorInfluence;

        // Keep the previous material's degree-based color correction and property names.
        float3 CharacterAlbedo(float2 uv)
        {
            float3 rgb = tex2D(_MainTex, uv).rgb * _Color.rgb;
            if (_HueShiftEnabled < 0.5) return rgb;
            float c = _HueBrightness * _HueSaturation * cos(radians(_HueShift));
            float s = _HueBrightness * _HueSaturation * sin(radians(_HueShift));
            float b = _HueBrightness;
            float3x3 correction = float3x3(
                .299*b + .701*c + .168*s, .587*b - .587*c + .330*s, .114*b - .114*c - .497*s,
                .299*b - .299*c - .328*s, .587*b + .413*c + .035*s, .114*b - .114*c + .292*s,
                .299*b - .300*c + 1.25*s, .587*b - .588*c - 1.05*s, .114*b + .886*c - .203*s);
            return max(0, mul(correction, rgb));
        }

        struct CharacterVertex
        {
            float4 vertex : POSITION;
            float3 normal : NORMAL;
            float2 texcoord : TEXCOORD0;
            float2 texcoord1 : TEXCOORD1;
            UNITY_VERTEX_INPUT_INSTANCE_ID
        };

        struct CharacterVaryings
        {
            float4 pos : SV_POSITION;
            float2 uv : TEXCOORD0;
            float3 worldPos : TEXCOORD1;
            float3 worldNormal : TEXCOORD2;
            UNITY_LIGHTING_COORDS(3,4)
            UNITY_VERTEX_OUTPUT_STEREO
        };

        CharacterVaryings CharacterVert(CharacterVertex v)
        {
            CharacterVaryings o;
            UNITY_SETUP_INSTANCE_ID(v);
            UNITY_INITIALIZE_OUTPUT(CharacterVaryings, o);
            UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
            o.pos = UnityObjectToClipPos(v.vertex);
            o.uv = TRANSFORM_TEX(v.texcoord, _MainTex);
            o.worldPos = mul(unity_ObjectToWorld, v.vertex).xyz;
            o.worldNormal = UnityObjectToWorldNormal(v.normal);
            UNITY_TRANSFER_LIGHTING(o, v.texcoord1);
            return o;
        }

        float3 CharacterDirect(CharacterVaryings i, float attenuation)
        {
            float ndl = saturate(dot(normalize(i.worldNormal), normalize(UnityWorldSpaceLightDir(i.worldPos))));
            float diffuse = _LightModel > 1.5
                ? smoothstep(_ToonCutoff, _ToonCutoff + max(_ToonSmoothness, 0.0001), ndl)
                : ndl;
            return _LightColor0.rgb * diffuse * attenuation;
        }
        ENDCG

        Pass
        {
            Name "FORWARD"
            Tags { "LightMode"="ForwardBase" }
            CGPROGRAM
            #pragma target 3.0
            #pragma vertex CharacterVert
            #pragma fragment CharacterFrag
            #pragma multi_compile_fwdbase nolightmap nodirlightmap nodynlightmap
            #pragma multi_compile_instancing

            float4 CharacterFrag(CharacterVaryings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                UNITY_LIGHT_ATTENUATION(attenuation, i, i.worldPos);
                float3 ambient = max(0, ShadeSH9(float4(normalize(i.worldNormal), 1)));
                #ifdef VERTEXLIGHT_ON
                ambient += Shade4PointLights(
                    unity_4LightPosX0, unity_4LightPosY0, unity_4LightPosZ0,
                    unity_LightColor[0].rgb, unity_LightColor[1].rgb,
                    unity_LightColor[2].rgb, unity_LightColor[3].rgb,
                    unity_4LightAtten0, i.worldPos, normalize(i.worldNormal));
                #endif
                float4 col = float4(CharacterAlbedo(i.uv) * (ambient + CharacterDirect(i, attenuation)), 1);
                return col;
            }
            ENDCG
        }

        Pass
        {
            Name "FORWARD_ADD"
            Tags { "LightMode"="ForwardAdd" }
            Blend One One
            ZWrite Off
            ColorMask RGB
            CGPROGRAM
            #pragma target 3.0
            #pragma vertex CharacterVert
            #pragma fragment CharacterAddFrag
            #pragma multi_compile_fwdadd_fullshadows
            #pragma multi_compile_instancing

            float4 CharacterAddFrag(CharacterVaryings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                UNITY_LIGHT_ATTENUATION(attenuation, i, i.worldPos);
                float4 col = float4(CharacterAlbedo(i.uv) * CharacterDirect(i, attenuation), 0);
                return col;
            }
            ENDCG
        }

        Pass
        {
            Name "OUTLINE"
            // 显式接收主方向光，避免 Always Pass 中光照变量不受保证。
            Tags { "LightMode"="ForwardBase" "PassFlags"="OnlyDirectional" }
            Cull Front
            ZWrite On
            ZTest LEqual
            Blend Off
            CGPROGRAM
            #pragma target 3.0
            #pragma vertex OutlineVert
            #pragma fragment OutlineFrag
            #pragma multi_compile_instancing

            struct OutlineVaryings
            {
                float4 pos : SV_POSITION;
                float width : TEXCOORD0;
                float2 normalVS : TEXCOORD1;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            // Vertex colors are consumed only by the outline pass; existing meshes opt out by default.
            struct OutlineVertex
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
                float4 color : COLOR;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            OutlineVaryings OutlineVert(OutlineVertex v)
            {
                OutlineVaryings o;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_OUTPUT(OutlineVaryings, o);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float mask = lerp(1.0, saturate(v.color.a), saturate(_OutlineVertexAlpha));
                o.pos = UnityObjectToClipPos(v.vertex);
                float3 normalVS = mul((float3x3)UNITY_MATRIX_V, UnityObjectToWorldNormal(v.normal));
                o.normalVS = normalVS.xy;
                if (_OutlineWidthMode > 0.5)
                {
                    o.width = max(0, _OutlineWidthPixels) * mask;
                    float4 normalCS = mul(UNITY_MATRIX_P, float4(normalVS, 0));
                    // Derivative of clip.xy / clip.w, including off-center perspective projection.
                    float2 direction = normalCS.xy * o.pos.w - o.pos.xy * normalCS.w;
                    float2 viewport = _ScreenParams.xy;
                    #if defined(UNITY_SINGLE_PASS_STEREO)
                    viewport *= unity_StereoScaleOffset[unity_StereoEyeIndex].xy;
                    #endif
                    float2 pixelDirection = direction * viewport;
                    // A camera-facing normal has no screen direction: avoid normalizing zero.
                    pixelDirection /= max(length(pixelDirection), 0.0001);
                    o.pos.xy += pixelDirection * (2.0 * o.width / max(viewport, 1.0)) * max(o.pos.w, 0.0);
                }
                else
                {
                    // Retain the previous centimeter-based width for comparison and compatibility.
                    o.width = max(0, _OutlineThickness) * mask;
                    float3 scale = float3(length(unity_ObjectToWorld._m00_m10_m20),
                        length(unity_ObjectToWorld._m01_m11_m21), length(unity_ObjectToWorld._m02_m12_m22));
                    v.vertex.xyz += v.normal * (o.width * 0.01 / max(scale, 0.00001));
                    o.pos = UnityObjectToClipPos(v.vertex);
                }
                return o;
            }

            float4 OutlineFrag(OutlineVaryings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                // Disabled outlines discard before writing color OR depth.
                clip(_OutlineType - 0.5);
                clip(i.width - 0.00001);
                // 在画面平面判断迎光方向；保持原始外向法线，不因 Cull Front 翻转。
                float3 lightVS = mul((float3x3)UNITY_MATRIX_V, _WorldSpaceLightPos0.xyz);
                lightVS /= max(length(lightVS), 0.0001);
                float projectedLightLength = length(lightVS.xy);
                float2 lightDirection = lightVS.xy / max(projectedLightLength, 0.0001);
                float normalLength = length(i.normalVS);
                float2 outlineDirection = i.normalVS / max(normalLength, 0.0001);
                float facing = dot(outlineDirection, lightDirection);
                float threshold = saturate(_OutlineLightThreshold);
                float softness = max(_OutlineLightSoftness, 0.0001);
                float lightMask = smoothstep(threshold, threshold + softness, facing);
                // 正对镜头的光没有明确的侧向方向，平滑淡出，避免方向跳变。
                lightMask *= smoothstep(0.0, 0.15, projectedLightLength);
                lightMask *= smoothstep(0.0, 0.05, normalLength);
                float3 mainLightColor = max(_LightColor0.rgb, 0.0);
                float lightBrightness = max(mainLightColor.r, max(mainLightColor.g, mainLightColor.b));
                // 只借用主光色相和弱光衰减，不采样阴影，不让 HDR 强光无限放大亮边。
                float3 lightTint = mainLightColor / max(lightBrightness, 0.0001);
                // 守岛环境启用时统一颜色；独立预览或其他场景保留材质配色。
                float usePalette = step(0.5, _IslandDefenderUseCharacterOutlinePalette);
                float3 darkColor = lerp(_OutlineColor.rgb,
                    _IslandDefenderCharacterOutlineDarkColor.rgb, usePalette);
                float3 lightColor = lerp(_OutlineLightColor.rgb,
                    _IslandDefenderCharacterOutlineLightColor.rgb, usePalette);
                float colorInfluence = lerp(_OutlineLightColorInfluence,
                    _IslandDefenderCharacterOutlineLightColorInfluence, usePalette);
                float3 highlight = lightColor
                    * lerp(float3(1, 1, 1), lightTint, saturate(colorInfluence));
                lightMask *= saturate(_OutlineLightStrength) * saturate(lightBrightness);
                float4 col = float4(lerp(darkColor, highlight, lightMask), 1);
                return col;
            }
            ENDCG
        }

        Pass
        {
            Name "SHADOWCASTER"
            Tags { "LightMode"="ShadowCaster" }
            ZWrite On
            ZTest LEqual
            Cull Back
            CGPROGRAM
            #pragma target 3.0
            #pragma vertex ShadowVert
            #pragma fragment ShadowFrag
            #pragma multi_compile_shadowcaster
            #pragma multi_compile_instancing

            struct ShadowVaryings
            {
                V2F_SHADOW_CASTER;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            ShadowVaryings ShadowVert(CharacterVertex v)
            {
                ShadowVaryings o;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_OUTPUT(ShadowVaryings, o);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                TRANSFER_SHADOW_CASTER_NORMALOFFSET(o)
                return o;
            }

            float4 ShadowFrag(ShadowVaryings i) : SV_Target
            {
                SHADOW_CASTER_FRAGMENT(i)
            }
            ENDCG
        }
    }
    FallBack Off
}
