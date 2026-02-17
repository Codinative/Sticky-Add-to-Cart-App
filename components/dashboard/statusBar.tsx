import { Icons } from "../common/icons";

export function StatusBar({ hasChanges, onSave, onReset, saving }: { hasChanges: boolean, onSave: () => void, onReset: () => void, saving: boolean }) {
    return (
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 transition-all duration-300
          ${hasChanges ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
        `}
      >
        <div className="bg-gray-900 border-t border-gray-700 shadow-2xl">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-300">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onReset}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              >
                <Icons.Undo size={15} />
                <span>Discard</span>
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Saving...</span>
                  </>
                ) : (
                  <>
                    <Icons.Save size={15} />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }