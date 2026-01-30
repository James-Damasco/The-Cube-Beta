using System.Collections;
using System.ComponentModel;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class LoadingController : MonoBehaviour {
    [Header("Settings")]
    [Tooltip("The Cube")]
    public string sceneToLoad;
    [Tooltip("3s")]
    public float timeBeforeLoading = 3.0f;

    [Header("UI References")]
    public GameObject loadingScreenObject;
    public Slider loadingBar;
    public text progressText;

    public void Start()
    {
        StartCoroutine(IntroSequence());
    }
    IEnumerator IntroSequence()
    {
        yield return new WaitForSeconds(timeBeforeLoading);
        if (loadingScreenObject != null) loadingScreenObject.SetActive(true);
    }
    IEnumerator LoadLevelAsync()
    {
        AsyncOperation operation = SceneManager.LoadSceneAsync(sceneToLoad);
        while (!operation.isDone)
        {
            float progress = MathF.Clamp01(operation.progress / 0.9f);
            if (loadingBar != null) loadingBar.value = progress;
            if (progressText != null) progressText.text = (progress * 100f).ToString("F0") + "%";

            yield return null;
        }
    }
}