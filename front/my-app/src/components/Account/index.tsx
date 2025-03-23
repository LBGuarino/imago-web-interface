"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import { AdminPanelSettings, VerifiedUser, Person } from "@mui/icons-material";

interface UserData {
  email: string;
  admin: boolean;
  approved: boolean;
  email_verified: boolean;
  uid: string;
}

interface AccountProps {
  userData: UserData;
}

export default function Account({ userData }: AccountProps) {
  return (
    <Box sx={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                mr: 2,
              }}
            >
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Perfil de Usuario
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userData.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AdminPanelSettings
                color={userData.admin ? "primary" : "disabled"}
              />
              <Typography>
                Rol: {userData.admin ? "Administrador" : "Usuario"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VerifiedUser
                color={userData.approved ? "success" : "disabled"}
              />
              <Typography>
                Estado:{" "}
                {userData.approved ? "Aprobado" : "Pendiente de aprobación"}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Chip
                label={
                  userData.email_verified
                    ? "Email verificado"
                    : "Email no verificado"
                }
                color={userData.email_verified ? "success" : "warning"}
                variant="outlined"
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              ID de usuario: {userData.uid}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
