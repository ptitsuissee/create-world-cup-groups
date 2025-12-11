import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  Clock,
  X,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AnalyticsStats {
  totalVisits: number;
  visitsLast24h: number;
  visitsLastWeek: number;
  visitsLastMonth: number;
  uniqueVisitors: number;
  uniqueVisitorsLast24h: number;
  totalInteractions: number;
  interactionsLast24h: number;
  interactionsLastWeek: number;
  interactionsLastMonth: number;
  pageViews: Record<string, number>;
  actionCounts: Record<string, number>;
  activeUsers: Record<
    string,
    { email: string; name: string; interactions: number }
  >;
}

interface Visit {
  page: string;
  userEmail: string;
  userName: string;
  timestamp: number;
  ip: string;
  userAgent: string;
}

interface Interaction {
  action: string;
  data: any;
  userEmail: string;
  userName: string;
  timestamp: number;
  ip: string;
}

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsDashboard({
  isOpen,
  onClose,
}: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [recentInteractions, setRecentInteractions] = useState<Interaction[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "visits" | "interactions" | "users"
  >("overview");

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        throw new Error("Vous devez être connecté pour accéder aux analytics");
      }
      
      console.log("Loading analytics with token:", token?.substring(0, 10) + "...");
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/admin/analytics`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Admin-Token": token,
          },
        }
      );

      console.log("Analytics response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Analytics error response:", errorData);
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Analytics data received:", data);

      if (data.success) {
        setStats(data.stats);
        setRecentVisits(data.recentVisits || []);
        setRecentInteractions(data.recentInteractions || []);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("Analytics error:", err);
      // Set default empty stats instead of error
      setStats({
        totalVisits: 0,
        visitsLast24h: 0,
        visitsLastWeek: 0,
        visitsLastMonth: 0,
        uniqueVisitors: 0,
        uniqueVisitorsLast24h: 0,
        totalInteractions: 0,
        interactionsLast24h: 0,
        interactionsLastWeek: 0,
        interactionsLastMonth: 0,
        pageViews: {},
        actionCounts: {},
        activeUsers: {},
      });
      setRecentVisits([]);
      setRecentInteractions([]);
      setError(
        err instanceof Error ? err.message : "Erreur de chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPageName = (page: string) => {
    const pageNames: Record<string, string> = {
      setup: "Configuration",
      matches: "Matchs",
      knockout: "Élimination directe",
      unknown: "Page inconnue",
    };
    return pageNames[page] || page;
  };

  const formatActionName = (action: string) => {
    const actionNames: Record<string, string> = {
      add_group: "Ajout de groupe",
      add_team: "Ajout d'équipe",
      random_draw: "Tirage au sort",
      create_match: "Création de match",
      update_score: "Mise à jour du score",
      save_project: "Sauvegarde du projet",
      load_project: "Chargement du projet",
      share_project: "Partage du projet",
    };
    return actionNames[action] || action;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Tableau de bord Analytics
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">
              Chargement des statistiques...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-4">
            ⚠️ {error} - Affichage des données par défaut
          </div>
        )}

        {!loading && stats && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              <Button
                variant={activeTab === "overview" ? "default" : "outline"}
                onClick={() => setActiveTab("overview")}
                className="whitespace-nowrap"
              >
                Vue d'ensemble
              </Button>
              <Button
                variant={activeTab === "visits" ? "default" : "outline"}
                onClick={() => setActiveTab("visits")}
                className="whitespace-nowrap"
              >
                Visites
              </Button>
              <Button
                variant={
                  activeTab === "interactions" ? "default" : "outline"
                }
                onClick={() => setActiveTab("interactions")}
                className="whitespace-nowrap"
              >
                Interactions
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "outline"}
                onClick={() => setActiveTab("users")}
                className="whitespace-nowrap"
              >
                Utilisateurs actifs
              </Button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-gray-600">
                        Visites totales
                      </h3>
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl text-blue-600">
                      {stats.totalVisits}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.visitsLast24h} dernières 24h
                    </p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-gray-600">
                        Visiteurs uniques
                      </h3>
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-3xl text-indigo-600">
                      {stats.uniqueVisitors}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.uniqueVisitorsLast24h} dernières 24h
                    </p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-gray-600">
                        Interactions
                      </h3>
                      <MousePointerClick className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl text-purple-600">
                      {stats.totalInteractions}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.interactionsLast24h} dernières 24h
                    </p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-gray-600">
                        Engagement
                      </h3>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl text-green-600">
                      {stats.totalVisits > 0
                        ? (
                            (stats.totalInteractions /
                              stats.totalVisits) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Taux d'interaction
                    </p>
                  </div>
                </div>

                {/* Time-based stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                    <h3 className="text-sm text-gray-600 mb-2">
                      Dernières 24h
                    </h3>
                    <div className="space-y-1">
                      <p className="text-lg">
                        {stats.visitsLast24h} visites
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.interactionsLast24h} interactions
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200">
                    <h3 className="text-sm text-gray-600 mb-2">
                      7 derniers jours
                    </h3>
                    <div className="space-y-1">
                      <p className="text-lg">
                        {stats.visitsLastWeek} visites
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.interactionsLastWeek} interactions
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                    <h3 className="text-sm text-gray-600 mb-2">
                      30 derniers jours
                    </h3>
                    <div className="space-y-1">
                      <p className="text-lg">
                        {stats.visitsLastMonth} visites
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.interactionsLastMonth} interactions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top pages and actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                    <h3 className="text-sm text-gray-600 mb-3">
                      Pages les plus visitées
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats.pageViews)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([page, count]) => (
                          <div
                            key={page}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {formatPageName(page)}
                            </span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      {Object.keys(stats.pageViews).length === 0 && (
                        <p className="text-sm text-gray-400">
                          Aucune visite enregistrée
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-indigo-200">
                    <h3 className="text-sm text-gray-600 mb-3">
                      Actions les plus fréquentes
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats.actionCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([action, count]) => (
                          <div
                            key={action}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">
                              {formatActionName(action)}
                            </span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      {Object.keys(stats.actionCounts).length === 0 && (
                        <p className="text-sm text-gray-400">
                          Aucune interaction enregistrée
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visits Tab */}
            {activeTab === "visits" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg">
                    Visites récentes ({recentVisits.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadAnalytics}
                  >
                    Actualiser
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentVisits.map((visit, index) => (
                    <div
                      key={index}
                      className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-200 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {formatPageName(visit.page)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {visit.userName !== "anonymous"
                                ? visit.userName
                                : "Visiteur anonyme"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(visit.timestamp)}
                            </span>
                            <span>{visit.ip}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentVisits.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Aucune visite enregistrée
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactions Tab */}
            {activeTab === "interactions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg">
                    Interactions récentes ({recentInteractions.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadAnalytics}
                  >
                    Actualiser
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentInteractions.map((interaction, index) => (
                    <div
                      key={index}
                      className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-indigo-200 hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="default">
                              {formatActionName(interaction.action)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {interaction.userName !== "anonymous"
                                ? interaction.userName
                                : "Utilisateur anonyme"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(interaction.timestamp)}
                            </span>
                            {interaction.ip && (
                              <span>{interaction.ip}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentInteractions.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Aucune interaction enregistrée
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg">
                    Utilisateurs actifs (
                    {Object.keys(stats.activeUsers).length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadAnalytics}
                  >
                    Actualiser
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(stats.activeUsers)
                    .sort((a, b) => b.interactions - a.interactions)
                    .map((user) => (
                      <div
                        key={user.email}
                        className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 hover:border-purple-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {user.interactions}{" "}
                            {user.interactions > 1
                              ? "interactions"
                              : "interaction"}
                          </Badge>
                        </div>
                      </div>
                    ))}

                  {Object.keys(stats.activeUsers).length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-400">
                      Aucun utilisateur actif
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}