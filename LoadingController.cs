using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections;

public class ProgrammaticLoading : MonoBehaviour
{
    private static ProgrammaticLoading instance;
    private Image progressBarFill;
    private Text loadingText;
    private GameObject canvasObject;

    private void Awake()
    {
        // Singleton pattern to ensure this survives scene transitions if needed
        if (instance != null && instance != this)
        {
            Destroy(this.gameObject);
            return;
        }
        instance = this;
        DontDestroyOnLoad(this.gameObject);
    }

    /// <summary>
    /// Call this method to start the loading process.
    /// </summary>
    /// <param name="sceneName">The name of the scene to load.</param>
    public void LoadScene(string sceneName)
    {
        // 1. Generate the UI entirely via Code
        CreateLoadingUI();

        // 2. Start the Async Loading Coroutine
        StartCoroutine(LoadSceneAsync(sceneName));
    }

    private IEnumerator LoadSceneAsync(string sceneName)
    {
        // Start loading the scene asynchronously
        AsyncOperation operation = SceneManager.LoadSceneAsync(sceneName);

        // Prevent the scene from activating immediately so we can show the bar filling
        operation.allowSceneActivation = false;

        float progress = 0f;

        while (!operation.isDone)
        {
            // Unity loads the scene up to 0.9 (90%), then waits for activation.
            // We map 0 -> 0.9 to 0 -> 1 for the progress bar.
            float targetProgress = Mathf.Clamp01(operation.progress / 0.9f);

            // Smoothly interpolate the progress bar for visual polish
            while (progress < targetProgress)
            {
                progress += Time.deltaTime * 0.5f; // Adjust speed here
                UpdateUI(progress);
                yield return null;
            }

            // Once we hit the "ready" state
            if (operation.progress >= 0.9f && progress >= 1f)
            {
                UpdateUI(1f);
                loadingText.text = "Press Any Key to Continue";

                if (Input.anyKeyDown)
                {
                    operation.allowSceneActivation = true;
                }
            }

            yield return null;
        }

        // Cleanup after loading finishes
        Destroy(canvasObject);
    }

    private void UpdateUI(float progress)
    {
        if (progressBarFill != null)
        {
            progressBarFill.fillAmount = progress;
        }
        
        if (loadingText != null && progress < 1f)
        {
            loadingText.text = $"Loading... {(progress * 100):0}%";
        }
    }

    // --- UI GENERATION CODE ---
    private void CreateLoadingUI()
    {
        // 1. Create Canvas
        canvasObject = new GameObject("LoadingCanvas");
        Canvas canvas = canvasObject.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvasObject.AddComponent<CanvasScaler>();
        canvasObject.AddComponent<GraphicRaycaster>();
        DontDestroyOnLoad(canvasObject);

        // 2. Create Background (Black Panel)
        GameObject backgroundObj = new GameObject("Background");
        backgroundObj.transform.SetParent(canvasObject.transform);
        Image bgImage = backgroundObj.AddComponent<Image>();
        bgImage.color = Color.black;
        StretchRect(backgroundObj.GetComponent<RectTransform>());

        // 3. Create Loading Bar Background (Gray Strip)
        GameObject barBgObj = new GameObject("BarBackground");
        barBgObj.transform.SetParent(canvasObject.transform);
        Image barBgImage = barBgObj.AddComponent<Image>();
        barBgImage.color = Color.gray;
        
        RectTransform barBgRect = barBgObj.GetComponent<RectTransform>();
        barBgRect.sizeDelta = new Vector2(500, 30); // Width 500, Height 30
        barBgRect.anchoredPosition = Vector2.zero;  // Center of screen

        // 4. Create Loading Bar Fill (Green Strip)
        GameObject barFillObj = new GameObject("BarFill");
        barFillObj.transform.SetParent(barBgObj.transform); // Child of Bar Background
        progressBarFill = barFillObj.AddComponent<Image>();
        progressBarFill.color = Color.green;
        progressBarFill.type = Image.Type.Filled;
        progressBarFill.fillMethod = Image.FillMethod.Horizontal;
        progressBarFill.fillOrigin = (int)Image.OriginHorizontal.Left;
        progressBarFill.fillAmount = 0f; // Start empty

        StretchRect(barFillObj.GetComponent<RectTransform>());

        // 5. Create Text
        GameObject textObj = new GameObject("LoadingText");
        textObj.transform.SetParent(canvasObject.transform);
        loadingText = textObj.AddComponent<Text>();
        loadingText.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); // Default Unity Font
        loadingText.color = Color.white;
        loadingText.alignment = TextAnchor.MiddleCenter;
        loadingText.fontSize = 24;

        RectTransform textRect = textObj.GetComponent<RectTransform>();
        textRect.sizeDelta = new Vector2(500, 50);
        textRect.anchoredPosition = new Vector2(0, 50); // Slightly above the bar
    }

    // Helper to stretch UI elements to fill their parent
    private void StretchRect(RectTransform rect)
    {
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;
    }
}