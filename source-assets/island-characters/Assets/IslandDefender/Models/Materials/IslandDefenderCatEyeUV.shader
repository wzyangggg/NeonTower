Shader "TreasureIsland/IslandDefender/Cat Eye UV"
{
    Properties
    {
        [MainTexture] _EyeWhiteTex ("Eye White", 2D) = "white" {}
        [MainColor] _EyeWhiteColor ("Eye White Color", Color) = (1, 1, 1, 1)
        _PupilTex ("Pupil", 2D) = "white" {}
        _PupilColor ("Pupil Color", Color) = (0.02, 0.01, 0.005, 1)
        _PupilSize ("Pupil Size", Range(0.01, 1)) = 0.48
        _PupilMaxMovementRatio ("Pupil Max Movement Ratio", Range(0, 1)) = 0.55

        // XY is a normalized direction; magnitude is clamped to 1.
        _PupilDirection ("Direction", Vector) = (0, 0, 0, 0)
    }

    SubShader
    {
        Tags
        {
            "Queue" = "Geometry"
            "RenderType" = "Opaque"
        }
        LOD 250
        Cull Back

        CGPROGRAM
        #pragma surface surf Standard fullforwardshadows addshadow
        #pragma target 3.0

        sampler2D _EyeWhiteTex;
        sampler2D _PupilTex;
        fixed4 _EyeWhiteColor;
        fixed4 _PupilColor;
        float _PupilSize;
        float _PupilMaxMovementRatio;
        float4 _PupilDirection;

        struct Input
        {
            float2 uv_EyeWhiteTex;
        };

        void surf(Input input, inout SurfaceOutputStandard output)
        {
            float2 eyeUV = input.uv_EyeWhiteTex;
            fixed4 eyeWhite = tex2D(_EyeWhiteTex, eyeUV) *
                _EyeWhiteColor;

            float pupilSize = clamp(_PupilSize, 0.0001, 1.0);
            float2 direction = _PupilDirection.xy;
            float directionLength = length(direction);
            if (directionLength > 1.0)
            {
                direction /= directionLength;
            }

            // Pupil size and pupil position are intentionally independent.
            // The material controls how much of the full travel is allowed,
            // preventing a direction correction from exposing too much eye white.
            const float movementRange = 0.2;
            float movementRatio = saturate(_PupilMaxMovementRatio);
            float2 pupilCenter = 0.5 +
                direction * movementRange * movementRatio;
            float2 pupilUV = (eyeUV - pupilCenter) / pupilSize + 0.5;

            float inside = step(0.0, pupilUV.x) *
                step(pupilUV.x, 1.0) *
                step(0.0, pupilUV.y) *
                step(pupilUV.y, 1.0);
            fixed4 pupil = tex2D(_PupilTex, pupilUV) * _PupilColor;

            // A white texture also produces a round pupil without extra art.
            float pupilCircle = 1.0 - smoothstep(
                0.48,
                0.5,
                length(pupilUV - 0.5));
            float pupilAlpha = saturate(pupil.a * inside * pupilCircle);

            output.Albedo = lerp(
                eyeWhite.rgb,
                pupil.rgb,
                pupilAlpha);
            output.Metallic = 0;
            output.Smoothness = 0;
            output.Alpha = 1;
        }
        ENDCG
    }

    FallBack "Standard"
}
