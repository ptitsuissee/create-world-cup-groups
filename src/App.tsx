import React, { useState, useEffect } from "react";
import { TouchDndProvider } from "./components/TouchDndProvider";
import { GroupCard } from "./components/GroupCard";
import { UnassignedZone } from "./components/UnassignedZone";
import { Logo } from "./components/Logo";
import { AdSpace } from "./components/AdSpace";
import { DrawWheel } from "./components/DrawWheel";
import { TeamDrawWheel } from "./components/TeamDrawWheel";
import { TeamSelectionModal } from "./components/TeamSelectionModal";
import { DrawModeModal } from "./components/DrawModeModal";
import { GroupSelectionModal } from "./components/GroupSelectionModal";
import { Toast } from "./components/Toast";
import { MatchesView } from "./components/MatchesView";
import { KnockoutView } from "./components/KnockoutView";
import { AuthModal } from "./components/AuthModal";
import { UserMenu } from "./components/UserMenu";
import {
  FeaturedProjects,
  type ProjectMetadata,
} from "./components/FeaturedProjects";
import { ProjectsGallery } from "./components/ProjectsGallery";
import { SaveProjectModal } from "./components/SaveProjectModal";
import { AvatarSelectionModal } from "./components/AvatarSelectionModal";
import { UserSettingsModal } from "./components/UserSettingsModal";
import { Footer } from "./components/Footer";
import { ContactModal } from "./components/ContactModal";
import { BugReportModal } from "./components/BugReportModal";
import { ShareProjectModal } from "./components/ShareProjectModal";
import {
  AdManagerModal,
  type AdItem,
} from "./components/AdManagerModal";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { AdminMessagesPanel } from "./components/AdminMessagesPanel";
import {
  translations,
  languageNames,
  type Language,
} from "./translations";
import {
  Globe,
  Shuffle,
  Trophy,
  Save,
  Share2,
} from "lucide-react";
import { trackVisit, trackInteraction } from "./utils/analytics";

export interface Country {
  id: string;
  name: string;
  type: "country" | "club";
  flag: string;
}

export interface Group {
  id: string;
  name: string;
  countries: Country[];
}

export interface Match {
  id: string;
  groupId: string;
  team1Id: string;
  team2Id: string;
  score1: number | null;
  score2: number | null;
  played: boolean;
  link?: string;
  linkName?: string;
  linkLogo?: string;
}

export interface TournamentSettings {
  rounds: 1 | 2 | 3;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
}

export interface InfoMessage {
  id: string;
  title: string;
  content: string;
  link?: string;
  linkName?: string;
  logo?: string;
}

export interface KnockoutMatch {
  id: string;
  round:
    | "round64"
    | "round32"
    | "round16"
    | "quarter"
    | "semi"
    | "final";
  matchNumber: number;
  team1?: string; // Can be team name or placeholder like "1st Group A"
  team2?: string;
  team1Source?: string; // Description of where team1 comes from
  team2Source?: string;
  score1: number | null;
  score2: number | null;
  played: boolean;
  winnerId?: string;
  link?: string;
  linkName?: string;
  linkLogo?: string;
}

const STORAGE_KEY_GROUPS = "matchdraw_groups";
const STORAGE_KEY_UNASSIGNED = "matchdraw_unassigned";
const STORAGE_KEY_LANGUAGE = "matchdraw_language";
const STORAGE_KEY_MATCHES = "matchdraw_matches";
const STORAGE_KEY_TOURNAMENT_SETTINGS =
  "matchdraw_tournament_settings";
const STORAGE_KEY_INFO_MESSAGES = "matchdraw_info_messages";

function App() {
  const [currentView, setCurrentView] = useState<
    "setup" | "matches" | "knockout"
  >("setup");
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassignedCountries, setUnassignedCountries] =
    useState<Country[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentSettings, setTournamentSettings] =
    useState<TournamentSettings>({
      rounds: 1,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
    });
  const [infoMessages, setInfoMessages] = useState<
    InfoMessage[]
  >([]);
  const [knockoutMatches, setKnockoutMatches] = useState<
    KnockoutMatch[]
  >([]);
  const [knockoutInfoMessages, setKnockoutInfoMessages] =
    useState<InfoMessage[]>([]);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [countryNameInput, setCountryNameInput] = useState("");
  const [countryFlagInput, setCountryFlagInput] = useState("");
  const [teamType, setTeamType] = useState<"country" | "club">(
    "country",
  );
  const [language, setLanguage] = useState<Language>("fr");
  const [showLanguageMenu, setShowLanguageMenu] =
    useState(false);
  const [showDrawModeModal, setShowDrawModeModal] =
    useState(false);
  const [showTeamSelectionModal, setShowTeamSelectionModal] =
    useState(false);
  const [showGroupSelectionModal, setShowGroupSelectionModal] =
    useState(false);
  const [showDrawWheel, setShowDrawWheel] = useState(false);
  const [showTeamDrawWheel, setShowTeamDrawWheel] =
    useState(false);
  const [selectedGroupForDraw, setSelectedGroupForDraw] =
    useState<Group | null>(null);
  const [currentDrawingTeam, setCurrentDrawingTeam] =
    useState<Country | null>(null);
  const [teamsToDrawQueue, setTeamsToDrawQueue] = useState<
    Country[]
  >([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warning" | "error";
  } | null>(null);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">(
    "login",
  );
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("😀");
  const [isAdmin, setIsAdmin] = useState(false);

  // User settings modals
  const [showUserSettingsModal, setShowUserSettingsModal] =
    useState(false);
  const [showAvatarSelection, setShowAvatarSelection] =
    useState(false);

  // Projects Gallery state
  const [showProjectsGallery, setShowProjectsGallery] =
    useState(false);
  const [savedProjects, setSavedProjects] = useState<
    ProjectMetadata[]
  >([]);
  const [currentProjectId, setCurrentProjectId] = useState<
    string | null
  >(null);
  const [currentProjectName, setCurrentProjectName] =
    useState<string>("");
  const [showSaveProjectModal, setShowSaveProjectModal] =
    useState(false);

  // Permissions state
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [projectCreatorName, setProjectCreatorName] =
    useState<string>("");
  const [projectCreatorEmail, setProjectCreatorEmail] =
    useState<string>("");
  const [projectCreatorAvatar, setProjectCreatorAvatar] =
    useState<string>("😀");

  // Profile viewing state
  const [showCreatorProfile, setShowCreatorProfile] =
    useState(false);

  // Contact & Bug Report state
  const [showContactModal, setShowContactModal] =
    useState(false);
  const [showBugReportModal, setShowBugReportModal] =
    useState(false);

  // Share Project state
  const [showShareModal, setShowShareModal] = useState(false);

  // Ads Manager state (Admin only)
  const [showAdManagerModal, setShowAdManagerModal] =
    useState(false);
  const [ads, setAds] = useState<AdItem[]>([]);

  // Analytics Dashboard state (Admin only)
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] =
    useState(false);

  // Admin Messages Panel state (Admin only)
  const [showAdminMessagesPanel, setShowAdminMessagesPanel] =
    useState(false);

  const t = translations[language];

  // Check authentication status on mount
  useEffect(() => {
    const authToken = localStorage.getItem("auth_token");
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");
    const avatar = localStorage.getItem("user_avatar");
    const admin = localStorage.getItem("is_admin");

    if (authToken && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserName(name || email.split("@")[0]);
      setUserAvatar(avatar || "😀");
      setIsAdmin(admin === "true");
    }
  }, []);

  // Check for shared project in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(
      window.location.search,
    );
    const projectId = urlParams.get("project");
    const mode = urlParams.get("mode");

    if (projectId && mode === "view") {
      // Load project in read-only mode
      handleLoadSavedProject(projectId);
      setIsReadOnly(true);
    }
  }, []);

  // Track page views
  useEffect(() => {
    trackVisit(currentView, {
      userEmail: isAuthenticated ? userEmail : undefined,
      userName: isAuthenticated ? userName : undefined,
    });
  }, [currentView, isAuthenticated, userEmail, userName]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_avatar");
    localStorage.removeItem("is_admin");
    setIsAuthenticated(false);
    setUserName("");
    setUserEmail("");
    setUserAvatar("😀");
    setIsAdmin(false);
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatar: string) => {
    setUserAvatar(avatar);
    localStorage.setItem("user_avatar", avatar);
    setToast({
      message: t.changeAvatar + " ✓",
      type: "success",
    });
  };

  // Handle user settings save
  const handleUserSettingsSave = (data: {
    name: string;
    email: string;
    password?: string;
  }) => {
    setUserName(data.name);
    setUserEmail(data.email);
    localStorage.setItem("user_name", data.name);
    localStorage.setItem("user_email", data.email);

    // If password changed, we would update it here (in real app, this would be server-side)
    if (data.password) {
      // In a real app, this would be an API call
      console.log("Password updated");
    }

    setToast({ message: t.settingsSaved, type: "success" });
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedGroups = localStorage.getItem(
        STORAGE_KEY_GROUPS,
      );
      const savedUnassigned = localStorage.getItem(
        STORAGE_KEY_UNASSIGNED,
      );
      const savedLanguage = localStorage.getItem(
        STORAGE_KEY_LANGUAGE,
      );
      const savedMatches = localStorage.getItem(
        STORAGE_KEY_MATCHES,
      );
      const savedTournamentSettings = localStorage.getItem(
        STORAGE_KEY_TOURNAMENT_SETTINGS,
      );
      const savedInfoMessages = localStorage.getItem(
        STORAGE_KEY_INFO_MESSAGES,
      );

      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      }
      if (savedUnassigned) {
        setUnassignedCountries(JSON.parse(savedUnassigned));
      }
      if (savedLanguage) {
        setLanguage(savedLanguage as Language);
      }
      if (savedMatches) {
        setMatches(JSON.parse(savedMatches));
      }
      if (savedTournamentSettings) {
        setTournamentSettings(
          JSON.parse(savedTournamentSettings),
        );
      }
      if (savedInfoMessages) {
        setInfoMessages(JSON.parse(savedInfoMessages));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_GROUPS,
        JSON.stringify(groups),
      );
      localStorage.setItem(
        STORAGE_KEY_UNASSIGNED,
        JSON.stringify(unassignedCountries),
      );
      localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
      localStorage.setItem(
        STORAGE_KEY_MATCHES,
        JSON.stringify(matches),
      );
      localStorage.setItem(
        STORAGE_KEY_TOURNAMENT_SETTINGS,
        JSON.stringify(tournamentSettings),
      );
      localStorage.setItem(
        STORAGE_KEY_INFO_MESSAGES,
        JSON.stringify(infoMessages),
      );
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [
    groups,
    unassignedCountries,
    language,
    matches,
    tournamentSettings,
    infoMessages,
  ]);

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = groupNameInput.trim();
    if (!trimmed) return;

    const newGroup: Group = {
      id: `group-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmed,
      countries: [],
    };

    setGroups([...groups, newGroup]);
    setGroupNameInput("");

    // Track interaction
    trackInteraction("add_group", { groupName: trimmed }, {
      userEmail: isAuthenticated ? userEmail : undefined,
      userName: isAuthenticated ? userName : undefined,
    });
  };

  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = countryNameInput.trim();
    if (!trimmedName) return;

    const newCountry: Country = {
      id: `country-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName,
      flag: countryFlagInput.trim() || "🏳️",
      type: teamType,
    };

    setUnassignedCountries([
      ...unassignedCountries,
      newCountry,
    ]);
    setCountryNameInput("");
    setCountryFlagInput("");
    setTeamType("country");

    // Track interaction
    trackInteraction("add_team", { teamName: trimmedName, teamType }, {
      userEmail: isAuthenticated ? userEmail : undefined,
      userName: isAuthenticated ? userName : undefined,
    });
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCountryFlagInput(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRandomDraw = () => {
    // Show mode selection modal
    setShowDrawModeModal(true);
  };

  const handleDrawModeSelect = (
    mode: "teams-to-groups" | "team-from-group",
  ) => {
    setShowDrawModeModal(false);

    if (mode === "teams-to-groups") {
      // Check preconditions
      if (unassignedCountries.length === 0) {
        setToast({
          message: t.noTeamsToAssign,
          type: "warning",
        });
        return;
      }

      if (groups.length === 0) {
        setToast({
          message: t.noGroupsCreated,
          type: "warning",
        });
        return;
      }

      // Open team selection modal
      setShowTeamSelectionModal(true);
    } else {
      // team-from-group mode - draw an available team to a selected group
      // Check if there are available teams
      if (unassignedCountries.length === 0) {
        setToast({
          message: t.noTeamsToAssign,
          type: "warning",
        });
        return;
      }

      // Check if there are groups
      if (groups.length === 0) {
        setToast({
          message: t.noGroupsCreated,
          type: "warning",
        });
        return;
      }

      // Open group selection modal
      setShowGroupSelectionModal(true);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    setShowGroupSelectionModal(false);

    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      return;
    }

    // Set the group and show the team draw wheel (drawing from available teams)
    setSelectedGroupForDraw(group);
    setShowTeamDrawWheel(true);
  };

  const handleTeamDrawComplete = (teamId: string) => {
    if (!selectedGroupForDraw) return;

    // Find the team in unassigned
    const team = unassignedCountries.find(
      (c) => c.id === teamId,
    );
    if (!team) return;

    // Add team to the selected group
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === selectedGroupForDraw.id) {
          return { ...g, countries: [...g.countries, team] };
        }
        return g;
      }),
    );

    // Remove from unassigned
    setUnassignedCountries((prev) =>
      prev.filter((c) => c.id !== teamId),
    );

    // Close modal after showing result
    setTimeout(() => {
      setShowTeamDrawWheel(false);
      setSelectedGroupForDraw(null);
    }, 500);
  };

  const handleCloseTeamDrawWheel = () => {
    setShowTeamDrawWheel(false);
    setSelectedGroupForDraw(null);
  };

  const handleStartDraw = (selectedTeamIds: string[]) => {
    setShowTeamSelectionModal(false);

    // Get selected teams
    const selectedTeams = unassignedCountries.filter((c) =>
      selectedTeamIds.includes(c.id),
    );

    // Shuffle teams
    const shuffled = [...selectedTeams].sort(
      () => Math.random() - 0.5,
    );

    // Set up the queue
    setTeamsToDrawQueue(shuffled);

    // Track interaction
    trackInteraction("random_draw", { teamsCount: selectedTeamIds.length }, {
      userEmail: isAuthenticated ? userEmail : undefined,
      userName: isAuthenticated ? userName : undefined,
    });

    // Start with first team
    if (shuffled.length > 0) {
      setCurrentDrawingTeam(shuffled[0]);
      setShowDrawWheel(true);
    }
  };

  const handleDrawComplete = (groupId: string) => {
    if (!currentDrawingTeam) return;

    // First, remove the team from ALL groups to avoid duplicates
    const cleanedGroups = groups.map((g) => ({
      ...g,
      countries: g.countries.filter(
        (c) => c.id !== currentDrawingTeam.id,
      ),
    }));

    // Then add to target group
    const newGroups = cleanedGroups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          countries: [...g.countries, currentDrawingTeam],
        };
      }
      return g;
    });
    setGroups(newGroups);

    // Remove from unassigned
    setUnassignedCountries((prev) =>
      prev.filter((c) => c.id !== currentDrawingTeam.id),
    );

    // Move to next team in queue
    const remainingQueue = teamsToDrawQueue.slice(1);
    setTeamsToDrawQueue(remainingQueue);

    if (remainingQueue.length > 0) {
      // Next team
      setTimeout(() => {
        setCurrentDrawingTeam(remainingQueue[0]);
        setShowDrawWheel(true);
      }, 500);
    } else {
      // All done
      setCurrentDrawingTeam(null);
      setShowDrawWheel(false);
      setTimeout(
        () =>
          setToast({
            message: t.drawComplete,
            type: "success",
          }),
        100,
      );
    }
  };

  const handleCloseDrawWheel = () => {
    // Cancel the draw
    setShowDrawWheel(false);
    setCurrentDrawingTeam(null);
    setTeamsToDrawQueue([]);
  };

  const moveCountryToGroup = (
    countryId: string,
    targetGroupId: string | null,
  ) => {
    // Find the country in all possible locations
    let country: Country | undefined;
    let sourceGroupId: string | null = null;

    // Check unassigned
    const unassignedCountry = unassignedCountries.find(
      (c) => c.id === countryId,
    );
    if (unassignedCountry) {
      country = unassignedCountry;
      sourceGroupId = null;
    }

    // Check groups
    if (!country) {
      for (const group of groups) {
        const found = group.countries.find(
          (c) => c.id === countryId,
        );
        if (found) {
          country = found;
          sourceGroupId = group.id;
          break;
        }
      }
    }

    if (!country) {
      // Country not found - it may have been already moved by draw or deleted
      // Ignore silently to avoid console warnings
      return;
    }

    // Don't move if source and target are the same
    if (sourceGroupId === targetGroupId) {
      return;
    }

    const countryToMove = { ...country };
    console.log("Moving country", {
      countryToMove,
      from: sourceGroupId,
      to: targetGroupId,
    });

    // Update groups - First remove from ALL groups, then add to target
    setGroups((prevGroups) => {
      // First pass: remove from all groups to avoid duplicates
      let cleanedGroups = prevGroups.map((g) => ({
        ...g,
        countries: g.countries.filter(
          (c) => c.id !== countryId,
        ),
      }));

      // Second pass: add to target group if applicable
      if (targetGroupId !== null) {
        cleanedGroups = cleanedGroups.map((g) => {
          if (g.id === targetGroupId) {
            // Check if country is already in this group (safety check)
            const alreadyExists = g.countries.some(
              (c) => c.id === countryId,
            );
            if (!alreadyExists) {
              return {
                ...g,
                countries: [...g.countries, countryToMove],
              };
            }
          }
          return g;
        });
      }

      return cleanedGroups;
    });

    // Update unassigned
    setUnassignedCountries((prevUnassigned) => {
      // Remove from unassigned if present
      const filtered = prevUnassigned.filter(
        (c) => c.id !== countryId,
      );

      // Add to unassigned if that's the target
      if (targetGroupId === null) {
        // Check if it's already there (safety check)
        const alreadyExists = filtered.some(
          (c) => c.id === countryId,
        );
        if (!alreadyExists) {
          return [...filtered, countryToMove];
        }
      }

      return filtered;
    });
  };

  const handleDeleteCountry = (countryId: string) => {
    // Remove from unassigned
    setUnassignedCountries((prev) =>
      prev.filter((c) => c.id !== countryId),
    );

    // Remove from all groups
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        countries: g.countries.filter(
          (c) => c.id !== countryId,
        ),
      })),
    );
  };

  const handleRenameGroup = (
    groupId: string,
    newName: string,
  ) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, name: newName } : g,
      ),
    );
  };

  const handleRenameTeam = (
    teamId: string,
    newName: string,
  ) => {
    // Update in unassigned
    setUnassignedCountries((prev) =>
      prev.map((c) =>
        c.id === teamId ? { ...c, name: newName } : c,
      ),
    );

    // Update in groups
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        countries: g.countries.map((c) =>
          c.id === teamId ? { ...c, name: newName } : c,
        ),
      })),
    );

    setToast({ message: t.teamRenamed, type: "success" });
  };

  const handleLoadProject = (data: {
    groups: Group[];
    unassignedCountries: Country[];
    matches: Match[];
  }) => {
    setGroups(data.groups);
    setUnassignedCountries(data.unassignedCountries);
    setMatches(data.matches);
    setToast({ message: t.projectLoaded, type: "success" });
  };

  const handleNewProject = () => {
    setGroups([]);
    setUnassignedCountries([]);
    setMatches([]);
    setCurrentView("setup");
    setToast({ message: t.projectSaved, type: "success" });
  };

  // Load saved projects from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "matchdraw_saved_projects",
      );
      if (saved) {
        setSavedProjects(JSON.parse(saved));
      }

      // Load ads
      const savedAds = localStorage.getItem("matchdraw_ads");
      if (savedAds) {
        setAds(JSON.parse(savedAds));
      }
    } catch (error) {
      console.error("Error loading saved projects:", error);
    }
  }, []);

  // Show save project modal
  const handleSaveCurrentProject = () => {
    if (!isAuthenticated) {
      setToast({
        message: t.loginRequired || "Connexion requise",
        type: "warning",
      });
      setAuthMode("login");
      setShowAuthModal(true);
      return;
    }

    setShowSaveProjectModal(true);
  };

  // Save project with name
  const handleSaveProjectWithName = (projectName: string) => {
    const projectId =
      currentProjectId ||
      `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const now = Date.now();

    const newProject: ProjectMetadata = {
      id: projectId,
      name: projectName.trim(),
      createdAt: currentProjectId
        ? savedProjects.find((p) => p.id === projectId)
            ?.createdAt || now
        : now,
      updatedAt: now,
      views: currentProjectId
        ? savedProjects.find((p) => p.id === projectId)
            ?.views || 0
        : 0,
      isFeatured: currentProjectId
        ? savedProjects.find((p) => p.id === projectId)
            ?.isFeatured || false
        : false,
      creatorName: userName,
      creatorEmail: userEmail,
      groupsCount: groups.length,
      teamsCount:
        groups.reduce((acc, g) => acc + g.countries.length, 0) +
        unassignedCountries.length,
    };

    // Save project data
    const projectData = {
      groups,
      unassignedCountries,
      matches,
      knockoutMatches,
    };
    localStorage.setItem(
      `matchdraw_project_${projectId}`,
      JSON.stringify(projectData),
    );

    // Update projects list
    const updatedProjects = currentProjectId
      ? savedProjects.map((p) =>
          p.id === projectId ? newProject : p,
        )
      : [...savedProjects, newProject];

    setSavedProjects(updatedProjects);
    localStorage.setItem(
      "matchdraw_saved_projects",
      JSON.stringify(updatedProjects),
    );
    setCurrentProjectId(projectId);
    setCurrentProjectName(projectName.trim());

    setShowSaveProjectModal(false);
    setToast({ message: t.projectSaved, type: "success" });

    // Track interaction
    trackInteraction("save_project", { projectName: projectName.trim() }, {
      userEmail: isAuthenticated ? userEmail : undefined,
      userName: isAuthenticated ? userName : undefined,
    });
  };

  // Load a project from saved projects
  const handleLoadSavedProject = (projectId: string) => {
    try {
      const projectData = localStorage.getItem(
        `matchdraw_project_${projectId}`,
      );
      if (!projectData) {
        setToast({
          message: t.projectNotFound || "Projet introuvable",
          type: "error",
        });
        return;
      }

      const data = JSON.parse(projectData);
      setGroups(data.groups || []);
      setUnassignedCountries(data.unassignedCountries || []);
      setMatches(data.matches || []);
      setKnockoutMatches(data.knockoutMatches || []);
      setCurrentProjectId(projectId);

      // Set project name and check permissions
      const project = savedProjects.find(
        (p) => p.id === projectId,
      );
      if (project) {
        setCurrentProjectName(project.name);
        setProjectCreatorName(project.creatorName);
        setProjectCreatorEmail(project.creatorEmail);
        setProjectCreatorAvatar(project.creatorAvatar || "😀");

        // Check if user is creator or admin
        const canEdit =
          isAdmin ||
          (isAuthenticated &&
            userEmail === project.creatorEmail);
        setIsReadOnly(!canEdit);

        if (!canEdit) {
          setToast({
            message: `${t.readOnlyMode} - ${t.readOnlyDesc} ${project.creatorName}`,
            type: "warning",
          });
        }
      }

      // Increment view count
      const updatedProjects = savedProjects.map((p) =>
        p.id === projectId ? { ...p, views: p.views + 1 } : p,
      );
      setSavedProjects(updatedProjects);
      localStorage.setItem(
        "matchdraw_saved_projects",
        JSON.stringify(updatedProjects),
      );

      setToast({ message: t.projectLoaded, type: "success" });
    } catch (error) {
      console.error("Error loading project:", error);
      setToast({
        message:
          t.errorLoadingProject || "Erreur lors du chargement",
        type: "error",
      });
    }
  };

  // Toggle featured status (admin only)
  const handleToggleFeatured = (projectId: string) => {
    if (!isAdmin) return;

    const updatedProjects = savedProjects.map((p) =>
      p.id === projectId
        ? { ...p, isFeatured: !p.isFeatured }
        : p,
    );
    setSavedProjects(updatedProjects);
    localStorage.setItem(
      "matchdraw_saved_projects",
      JSON.stringify(updatedProjects),
    );

    setToast({
      message: updatedProjects.find((p) => p.id === projectId)
        ?.isFeatured
        ? t.projectFeatured || "Projet mis en vedette"
        : t.projectUnfeatured || "Retirer de la vedette",
      type: "success",
    });
  };

  // Delete a project (admin only)
  const handleDeleteProject = (projectId: string) => {
    if (!isAdmin) return;

    // Remove project data
    localStorage.removeItem(`matchdraw_project_${projectId}`);

    // Remove from projects list
    const updatedProjects = savedProjects.filter(
      (p) => p.id !== projectId,
    );
    setSavedProjects(updatedProjects);
    localStorage.setItem(
      "matchdraw_saved_projects",
      JSON.stringify(updatedProjects),
    );

    // If it was the current project, clear it
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
      handleNewProject();
    }

    setToast({
      message: t.projectDeleted || "Projet supprimé",
      type: "success",
    });
  };

  // Check if we can show matches view button
  const canShowMatchesView = groups.some(
    (g) => g.countries.length >= 2,
  );

  // If we're in matches view, render that component
  if (currentView === "matches") {
    return (
      <MatchesView
        groups={groups}
        matches={matches}
        onMatchesChange={setMatches}
        onBackToSetup={() => setCurrentView("setup")}
        onRenameTeam={handleRenameTeam}
        language={language}
        onLanguageChange={setLanguage}
        tournamentSettings={tournamentSettings}
        onTournamentSettingsChange={(settings) => {
          setTournamentSettings(settings);
          setToast({
            message: t.settingsSaved,
            type: "success",
          });
        }}
        infoMessages={infoMessages}
        onInfoMessagesChange={setInfoMessages}
        onViewKnockout={() => setCurrentView("knockout")}
        onSaveProject={handleSaveCurrentProject}
        userName={userName}
        userEmail={userEmail}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onOpenSettings={() => setShowUserSettingsModal(true)}
        onOpenAdManager={() => setShowAdManagerModal(true)}
        onOpenMessages={() => setShowAdminMessagesPanel(true)}
        ads={ads}
      />
    );
  }

  // If we're in knockout view, render that component
  if (currentView === "knockout") {
    return (
      <KnockoutView
        groups={groups}
        knockoutMatches={knockoutMatches}
        onKnockoutMatchesChange={setKnockoutMatches}
        onBackToGroups={() => setCurrentView("matches")}
        infoMessages={knockoutInfoMessages}
        onInfoMessagesChange={setKnockoutInfoMessages}
        translations={t}
        onSaveProject={handleSaveCurrentProject}
        language={language}
        onOpenContact={() => setShowContactModal(true)}
        onOpenBugReport={() => setShowBugReportModal(true)}
        userName={userName}
        userEmail={userEmail}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onOpenSettings={() => setShowUserSettingsModal(true)}
        onOpenAdManager={() => setShowAdManagerModal(true)}
        onOpenMessages={() => setShowAdminMessagesPanel(true)}
        ads={ads}
      />
    );
  }

  return (
    <TouchDndProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-gray-50 p-6 relative">
        {/* Ad Spaces */}
        <AdSpace position="left" ads={ads} />
        <AdSpace position="right" ads={ads} />

        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Header */}
          <div className="relative text-center space-y-4 py-4 sm:py-8">
            {/* Top right controls */}
            <div className="absolute top-0 right-0 flex flex-wrap items-center gap-1.5 sm:gap-3 max-w-[calc(100%-100px)] sm:max-w-none">
              {/* Authentication buttons */}
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setShowAuthModal(true);
                    }}
                    className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/15 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/25 hover:bg-white/25 transition-all shadow-lg hover:shadow-xl text-[10px] sm:text-sm font-medium whitespace-nowrap"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode("signup");
                      setShowAuthModal(true);
                    }}
                    className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl text-[10px] sm:text-sm font-medium whitespace-nowrap"
                  >
                    {t.signup}
                  </button>
                </>
              ) : (
                <UserMenu
                  userName={userName}
                  userEmail={userEmail}
                  userAvatar={userAvatar}
                  isAdmin={isAdmin}
                  onLogout={handleLogout}
                  onOpenSettings={() =>
                    setShowUserSettingsModal(true)
                  }
                  onOpenProjects={() =>
                    setShowProjectsGallery(true)
                  }
                  onOpenAdManager={() =>
                    setShowAdManagerModal(true)
                  }
                  onOpenAnalytics={() =>
                    setShowAnalyticsDashboard(true)
                  }
                  onOpenMessages={() =>
                    setShowAdminMessagesPanel(true)
                  }
                  translations={t}
                  ads={ads}
                />
              )}

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() =>
                    setShowLanguageMenu(!showLanguageMenu)
                  }
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/15 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/25 hover:bg-white/25 transition-all shadow-lg hover:shadow-xl"
                >
                  <Globe size={14} className="sm:hidden" />
                  <Globe size={18} className="hidden sm:block" />
                  <span className="text-[10px] sm:text-sm whitespace-nowrap">
                    {languageNames[language]}
                  </span>
                </button>

                {showLanguageMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white/15 backdrop-blur-xl rounded-xl border border-white/25 shadow-2xl overflow-hidden z-50 min-w-[180px]">
                    {(
                      Object.keys(languageNames) as Language[]
                    ).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-white/20 transition-all text-sm ${
                          language === lang ? "bg-white/25" : ""
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Logo and Title - with padding to avoid overlap */}
            <div className="inline-flex items-center gap-2 sm:gap-4 pt-12 sm:pt-0 px-2">
              <Logo size={64} className="drop-shadow-2xl hidden md:block flex-shrink-0" />
              <Logo size={40} className="drop-shadow-2xl md:hidden flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-5xl bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  {t.appName}
                </h1>
                <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-40 mt-1 sm:mt-2"></div>
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto px-4">
              {t.tagline}
            </p>
          </div>

          {/* Featured Projects / Events Section */}
          <FeaturedProjects
            projects={savedProjects}
            isAdmin={isAdmin}
            onToggleFeatured={handleToggleFeatured}
            onViewAllProjects={() =>
              setShowProjectsGallery(true)
            }
            onLoadProject={handleLoadSavedProject}
            translations={t}
          />

          {/* Read-Only Mode Banner */}
          {isReadOnly && currentProjectId && (
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-orange-400/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl shadow-lg">
                    👁️
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl">
                      🔒 {t.readOnlyMode}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t.readOnlyDesc}{" "}
                      <span className="font-semibold">
                        {projectCreatorName}
                      </span>
                      {isAdmin && (
                        <span className="ml-2 px-2 py-1 bg-yellow-500/30 rounded text-xs">
                          ⚡ {t.adminCanModify}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreatorProfile(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all flex items-center gap-2 text-sm"
                >
                  👤 {t.createdBy}
                </button>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                ⚙️
              </div>
              <h2 className="text-xl sm:text-2xl">{t.creation}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Group Form */}
              <form
                onSubmit={handleAddGroup}
                className="space-y-3"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <label className="block text-sm text-white/80 mb-2">
                    🎯 {t.groupName}
                  </label>
                  <input
                    type="text"
                    value={groupNameInput}
                    onChange={(e) =>
                      setGroupNameInput(e.target.value)
                    }
                    placeholder={t.groupNamePlaceholder}
                    className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder:text-white/40 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full mt-3 rounded-xl px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    ➕ {t.addGroup}
                  </button>
                </div>
              </form>

              {/* Country/Team Form */}
              <form
                onSubmit={handleAddCountry}
                className="space-y-3"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  {/* Team Type Selector */}
                  <label className="block text-sm text-white/80 mb-2">
                    ⚽ {t.teamType}
                  </label>
                  <div className="flex gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setTeamType("country")}
                      className={`flex-1 py-2.5 rounded-lg transition-all ${
                        teamType === "country"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg scale-105"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      🌍 {t.teamTypeCountry}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamType("club")}
                      className={`flex-1 py-2.5 rounded-lg transition-all ${
                        teamType === "club"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg scale-105"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      🏆 {t.teamTypeClub}
                    </button>
                  </div>

                  <label className="block text-sm text-white/80 mb-2">
                    {teamType === "country" ? "🌍" : "🏆"}{" "}
                    {t.teamName}
                  </label>
                  <input
                    type="text"
                    value={countryNameInput}
                    onChange={(e) =>
                      setCountryNameInput(e.target.value)
                    }
                    placeholder={t.teamNamePlaceholder}
                    className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder:text-white/40 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    required
                  />

                  <div className="mt-3 space-y-2">
                    <label className="block text-sm text-white/80">
                      🏳️ {t.flag}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={countryFlagInput}
                        onChange={(e) =>
                          setCountryFlagInput(e.target.value)
                        }
                        placeholder={t.flagPlaceholder}
                        className="flex-1 rounded-xl border border-white/20 px-4 py-2 bg-white/10 text-white placeholder:text-white/40 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                      />
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-blue-400 transition-all flex items-center gap-2">
                          📁{" "}
                          <span className="text-sm">
                            {t.import}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 rounded-xl px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    ➕ {t.addTeam}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Save & Share Project Buttons */}
          <section className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-green-400/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">
                  <Save size={24} />
                </div>
                <div>
                  <h3 className="text-xl">{t.saveProject}</h3>
                  <p className="text-sm text-white/70">
                    {currentProjectName
                      ? `📝 ${currentProjectName}`
                      : t.saveYourWork ||
                        "Sauvegardez votre travail"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveCurrentProject}
                  className="px-6 sm:px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  <span>
                    {currentProjectName ? t.update : t.save}
                  </span>
                </button>
                {currentProjectId && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    title={t.shareProject}
                  >
                    🔗 {t.shareProject}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Random Draw Button */}
          {unassignedCountries.length > 0 &&
            groups.length > 0 && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-green-400/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0">
                      <Shuffle size={20} className="sm:hidden" />
                      <Shuffle size={24} className="hidden sm:block" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl">
                        {t.randomDraw}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70">
                        {t.randomDrawDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRandomDraw}
                    className="w-full md:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Shuffle size={18} className="sm:hidden" />
                    <Shuffle size={20} className="hidden sm:block" />
                    <span>{t.randomDraw}</span>
                  </button>
                </div>
              </div>
            )}

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 sm:gap-6 items-start">
            {/* Unassigned Countries */}
            <UnassignedZone
              countries={unassignedCountries}
              onDrop={(countryId) =>
                moveCountryToGroup(countryId, null)
              }
              onDelete={handleDeleteCountry}
              translations={t}
            />

            {/* Groups */}
            <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 min-h-[300px]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                  🧩
                </div>
                <h2 className="text-xl sm:text-2xl">{t.myGroups}</h2>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-16 text-white/50">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-lg">
                    {t.createFirstGroup}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onDrop={(countryId) =>
                        moveCountryToGroup(countryId, group.id)
                      }
                      onDelete={handleDeleteCountry}
                      onRename={handleRenameGroup}
                      translations={t}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Button to go to Matches & Standings */}
          {canShowMatchesView && (
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-400/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl">
                      {t.matchesAndStandings}
                    </h3>
                    <p className="text-sm text-white/70">
                      {t.matchesAndStandingsDesc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView("matches")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Trophy size={20} />
                  <span>{t.viewMatches}</span>
                </button>
              </div>
            </div>
          )}

          {/* Team Selection Modal */}
          {showTeamSelectionModal && (
            <TeamSelectionModal
              teams={unassignedCountries}
              onConfirm={handleStartDraw}
              onClose={() => setShowTeamSelectionModal(false)}
              translations={t}
            />
          )}

          {/* Draw Wheel */}
          {showDrawWheel && currentDrawingTeam && (
            <DrawWheel
              team={currentDrawingTeam}
              groups={groups}
              onComplete={handleDrawComplete}
              onClose={handleCloseDrawWheel}
              translations={t}
            />
          )}

          {/* Team Draw Wheel */}
          {showTeamDrawWheel && selectedGroupForDraw && (
            <TeamDrawWheel
              group={selectedGroupForDraw}
              availableTeams={unassignedCountries}
              onComplete={handleTeamDrawComplete}
              onClose={handleCloseTeamDrawWheel}
              translations={t}
            />
          )}

          {/* Draw Mode Modal */}
          {showDrawModeModal && (
            <DrawModeModal
              onSelectMode={handleDrawModeSelect}
              onClose={() => setShowDrawModeModal(false)}
              translations={t}
            />
          )}

          {/* Group Selection Modal */}
          {showGroupSelectionModal && (
            <GroupSelectionModal
              groups={groups}
              onSelectGroup={handleGroupSelect}
              onClose={() => setShowGroupSelectionModal(false)}
              translations={t}
            />
          )}

          {/* Toast */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          {/* Authentication Modal */}
          {showAuthModal && (
            <AuthModal
              mode={authMode}
              onClose={() => setShowAuthModal(false)}
              onSwitchMode={() =>
                setAuthMode(
                  authMode === "login" ? "signup" : "login",
                )
              }
              translations={t}
            />
          )}

          {/* Projects Gallery Modal */}
          {showProjectsGallery && (
            <ProjectsGallery
              projects={savedProjects}
              isAdmin={isAdmin}
              onToggleFeatured={handleToggleFeatured}
              onLoadProject={handleLoadSavedProject}
              onDeleteProject={handleDeleteProject}
              onClose={() => setShowProjectsGallery(false)}
              translations={t}
            />
          )}

          {/* Save Project Modal */}
          {showSaveProjectModal && (
            <SaveProjectModal
              currentProjectName={currentProjectName}
              onSave={handleSaveProjectWithName}
              onClose={() => setShowSaveProjectModal(false)}
              translations={t}
            />
          )}

          {/* Avatar Selection Modal */}
          {showAvatarSelection && (
            <AvatarSelectionModal
              currentAvatar={userAvatar}
              onSelect={handleAvatarSelect}
              onClose={() => setShowAvatarSelection(false)}
              translations={t}
            />
          )}

          {/* User Settings Modal */}
          {showUserSettingsModal && (
            <UserSettingsModal
              userName={userName}
              userEmail={userEmail}
              userAvatar={userAvatar}
              onSave={handleUserSettingsSave}
              onAvatarClick={() => {
                setShowUserSettingsModal(false);
                setShowAvatarSelection(true);
              }}
              onClose={() => setShowUserSettingsModal(false)}
              translations={t}
            />
          )}

          {/* Creator Profile Modal (Read-Only) */}
          {showCreatorProfile && (
            <UserSettingsModal
              userName={projectCreatorName}
              userEmail={projectCreatorEmail}
              userAvatar={projectCreatorAvatar}
              onSave={() => {}} // No-op for read-only
              onAvatarClick={() => {}} // No-op for read-only
              onClose={() => setShowCreatorProfile(false)}
              translations={t}
              isReadOnly={true}
            />
          )}

          {/* Contact Modal */}
          {showContactModal && (
            <ContactModal
              isOpen={showContactModal}
              onClose={() => setShowContactModal(false)}
              language={language}
              onShowToast={(message) =>
                setToast({ message, type: "success" })
              }
            />
          )}

          {/* Bug Report Modal */}
          {showBugReportModal && (
            <BugReportModal
              isOpen={showBugReportModal}
              onClose={() => setShowBugReportModal(false)}
              language={language}
              onShowToast={(message) =>
                setToast({ message, type: "success" })
              }
            />
          )}

          {/* Share Project Modal */}
          {showShareModal &&
            currentProjectId &&
            currentProjectName && (
              <ShareProjectModal
                projectId={currentProjectId}
                projectName={currentProjectName}
                onClose={() => setShowShareModal(false)}
                translations={t}
              />
            )}

          {/* Ad Manager Modal */}
          {showAdManagerModal && (
            <AdManagerModal
              ads={ads}
              onSave={(newAds) => {
                setAds(newAds);
                localStorage.setItem(
                  "matchdraw_ads",
                  JSON.stringify(newAds),
                );
                setToast({
                  message: "Publicités mises à jour !",
                  type: "success",
                });
              }}
              onClose={() => setShowAdManagerModal(false)}
              translations={t}
            />
          )}

          {/* Admin Messages Panel */}
          {showAdminMessagesPanel && isAdmin && (
            <AdminMessagesPanel
              onClose={() => setShowAdminMessagesPanel(false)}
              translations={t}
              authToken={localStorage.getItem("auth_token") || ""}
            />
          )}

          {/* Analytics Dashboard */}
          {showAnalyticsDashboard && isAdmin && (
            <AnalyticsDashboard
              isOpen={showAnalyticsDashboard}
              onClose={() => setShowAnalyticsDashboard(false)}
            />
          )}
        </div>

        {/* Footer with Contact & Bug Report buttons */}
        <Footer
          language={language}
          onOpenContact={() => setShowContactModal(true)}
          onOpenBugReport={() => setShowBugReportModal(true)}
        />
      </div>
    </TouchDndProvider>
  );
}

export default App;